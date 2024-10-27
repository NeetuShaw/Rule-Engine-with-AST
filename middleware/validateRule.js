const validateRule = (req, res, next) => {
    const { ruleString } = req.body;

    if (!ruleString) {
        return res.status(400).json({ error: 'Rule string is required.' });
    }

    // Regex to match valid tokens
    const validOperators = ['>', '<', '>=', '<=', '=', 'AND', 'OR', '(', ')'];
    const tokens = ruleString.match(/\b\w+\b\s*(>=|<=|>|<|=)\s*'?([^'\s]+)'?|\(|\)|AND|OR/g);

    if (!tokens) {
        return res.status(400).json({ error: 'Invalid rule string format. Ensure it follows the correct syntax.' });
    }

    for (const token of tokens) {
        const isValidOperator = validOperators.includes(token);
        if (!isValidOperator && !/^\w+$/.test(token) && !/^'[^']*'$/.test(token)) {
            console.error(`Invalid token found in rule string: '${token}' from input: '${ruleString}'`);
            return res.status(400).json({ error: `Invalid token in rule string: ${token}. Ensure you use valid attributes and operators.` });
        }
    }

    next();
};

module.exports = { validateRule };
