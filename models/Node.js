// models/Node.js
const mongoose = require('mongoose');

// Define the Node schema
const NodeSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'operator' or 'operand'
    left: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }, // Reference to the left child node
    right: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' }, // Reference to the right child node
    value: mongoose.Schema.Types.Mixed, // Holds values for operand nodes (e.g., numbers, strings)
});

// Create and export the Node model
module.exports = mongoose.model('Node', NodeSchema);
