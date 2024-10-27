// routes/rules.js
const express = require('express');
const router = express.Router();
const { Rule, Node } = require('../models/Rule');

async function parseRuleToAST(ruleString) {
    const tokens = ruleString.match(/\w+\s*(>=|<=|>|<|=)\s*'?[^'\s]+?'?|\(|\)|AND|OR/g);
    const stack = [];
    const operatorStack = [];
    let openParentheses = 0;

    for (const token of tokens) {
        if (token === '(') {
            operatorStack.push(token);
            openParentheses++;
        } else if (token === ')') {
            if (openParentheses === 0) {
                throw new Error('Syntax error: Unmatched closing parenthesis');
            }
            openParentheses--;

            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                const operator = operatorStack.pop();
                const right = stack.pop();
                const left = stack.pop();

                if (!left || !right) {
                    throw new Error('Invalid operator structure: missing left or right node');
                }

                const operatorNode = new Node({
                    type: 'operator',
                    left: left._id,
                    right: right._id,
                    value: operator,
                });
                await operatorNode.save();
                stack.push(operatorNode);
            }
            operatorStack.pop();
        } else if (token === 'AND' || token === 'OR') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                const operator = operatorStack.pop();
                const right = stack.pop();
                const left = stack.pop();

                if (!left || !right) {
                    throw new Error('Invalid operator structure: missing left or right node');
                }

                const operatorNode = new Node({
                    type: 'operator',
                    left: left._id,
                    right: right._id,
                    value: operator,
                });
                await operatorNode.save();
                stack.push(operatorNode);
            }
            operatorStack.push(token);
        } else {
            const conditionMatch = token.match(/(\w+)\s*(>=|<=|>|<|=)\s*'?([^'\s]+)'?/);
            if (!conditionMatch) {
                throw new Error('Invalid token structure: ' + token);
            }

            const field = conditionMatch[1].trim();
            const operator = conditionMatch[2].trim();
            const value = isNaN(conditionMatch[3]) ? conditionMatch[3].trim() : parseFloat(conditionMatch[3]);

            const operandNode = new Node({
                type: 'operand',
                left: field,
                right: value,
                operator: operator,
            });
            await operandNode.save();
            stack.push(operandNode);
        }
    }

    if (openParentheses !== 0) {
        throw new Error('Syntax error: Unmatched opening parenthesis');
    }

    while (operatorStack.length) {
        const operator = operatorStack.pop();
        const right = stack.pop();
        const left = stack.pop();

        if (!left || !right) {
            throw new Error('Invalid operator structure: missing left or right node');
        }

        const operatorNode = new Node({
            type: 'operator',
            left: left._id,
            right: right._id,
            value: operator,
        });
        await operatorNode.save();
        stack.push(operatorNode);
    }

    if (stack.length === 0) {
        throw new Error('No valid nodes created in the stack');
    }

    return stack[0];
}

// Create Rule Endpoint
router.post('/create_rule', async (req, res) => {
    const { ruleString } = req.body;

    // Check if ruleString is provided
    if (!ruleString) {
        return res.status(400).json({ error: 'Rule string is required.' });
    }

    try {
        // Create AST from rule string
        const rootNode = await parseRuleToAST(ruleString); // Make this call asynchronous

        // Save the rule with the rootNode reference
        const rule = new Rule({ ruleString, rootNode: rootNode._id });
        await rule.save();

        res.status(201).json({ message: 'Rule created successfully', rule });
    } catch (error) {
        console.error('Error creating rule:', error.message); // Log error for server
        res.status(400).json({ error: `Failed to create rule: ${error.message}` });
    }
});

// Combine Rules Endpoint
router.post('/combine_rules', async (req, res) => {
    const { ruleIds } = req.body;

    try {
        console.log("Received rule IDs for combining:", ruleIds); // Log received data

        const ruleObjects = await Promise.all(
            ruleIds.map(async (id) => {
                const rule = await Rule.findById(id).populate('rootNode');
                if (!rule) throw new Error(`Rule not found with ID: ${id}`);
                return rule;
            })
        );

        if (ruleObjects.length === 0) {
            return res.status(404).json({ error: 'No rules found for the provided IDs.' });
        }

        // Begin combining logic
        let combinedRootNode = ruleObjects[0].rootNode;

        for (let i = 1; i < ruleObjects.length; i++) {
            const rule = ruleObjects[i];
            const operator = 'OR'; 

            const combinedNode = new Node({
                type: 'operator',
                left: combinedRootNode._id,
                right: rule.rootNode._id,
                value: operator,
            });

            await combinedNode.save();
            console.log("Created combined node:", combinedNode);

            combinedRootNode = combinedNode;
        }

        // Save the final combined rule
        const combinedRule = new Rule({
            ruleString: `Combined Rule (${ruleIds.join(', ')})`,
            rootNode: combinedRootNode._id,
        });
        await combinedRule.save();

        res.status(201).json({ message: 'Rules combined successfully', combinedRule });
    } catch (error) {
        console.error('Error combining rules:', error.message);
        res.status(500).json({ error: `Failed to combine rules: ${error.message}` });
    }
});

// Get All Rules Endpoint
router.get('/', async (req, res) => {
    try {
        const rules = await Rule.find().populate('rootNode'); // Optionally populate to get full node data
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Evaluate Rule Endpoint
router.post('/evaluate_rule', async (req, res) => {
    const { ruleId, data } = req.body;

    try {
        // Fetch the rule and its root node
        const rule = await Rule.findById(ruleId).populate('rootNode');

        if (!rule) {
            return res.status(404).json({ error: 'Rule not found.' });
        }

        // Evaluate the rule
        const result = await evaluateNode(rule.rootNode, data);

        res.status(200).json({ valid: result });
    } catch (error) {
        console.error('Error evaluating rule:', error.message); // Log error for server
        res.status(500).json({ error: `Failed to evaluate rule: ${error.message}` });
    }
});


// Function to evaluate nodes recursively
async function evaluateNode(nodeId, data) {
    const node = await Node.findById(nodeId);

    if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
    }

    if (node.type === 'operand') {
        const leftValue = data[node.left];
        const rightValue = node.right;

        switch (node.operator) {
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '=': return leftValue === rightValue;
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            default: throw new Error('Invalid operator: ' + node.operator);
        }
    } else if (node.type === 'operator') {
        const leftResult = await evaluateNode(node.left, data);
        const rightResult = await evaluateNode(node.right, data);

        return node.value === 'AND' ? leftResult && rightResult : leftResult || rightResult;
    }
}

// Delete Rule Endpoint
router.delete('/delete_rule/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the rule by ID and delete it
        const deletedRule = await Rule.findByIdAndDelete(id);

        if (!deletedRule) {
            return res.status(404).json({ error: 'Rule not found.' });
        }

        res.status(200).json({ message: 'Rule deleted successfully', deletedRule });
    } catch (error) {
        console.error('Error deleting rule:', error.message); // Log error for server
        res.status(500).json({ error: `Failed to delete rule: ${error.message}` });
    }
});

module.exports = router;
