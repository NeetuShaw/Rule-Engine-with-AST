const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const rulesRouter = require('./routes/rules');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/ruleEngine', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

  app.use(cors()); // Enable CORS

app.use(bodyParser.json());
app.use('/rules', rulesRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
