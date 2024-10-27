const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nodeSchema = new Schema({
    type: {
        type: String,
        enum: ['operand', 'operator'],
        required: true,
    },
    left: { type: Schema.Types.Mixed, required: true }, // Stores field name or reference to another Node
    right: { type: Schema.Types.Mixed, required: true }, // Stores value or reference to another Node
    operator: { type: String, required: false }, // Optional operator for operand nodes
    value: { type: String, required: false }, // Operator value for operator nodes (e.g., AND, OR)
});

const ruleSchema = new Schema({
    ruleString: { type: String, required: true },
    rootNode: { type: Schema.Types.ObjectId, ref: 'Node', required: true },
});

const Node = mongoose.model('Node', nodeSchema);
const Rule = mongoose.model('Rule', ruleSchema);

module.exports = { Rule, Node };
