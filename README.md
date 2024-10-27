# Rule Engine with AST

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Data Structure](#data-structure)
5. [Sample Rules](#sample-rules)
6. [Project Setup](#project-setup)
7. [API Design](#api-design)
8. [Usage](#usage)
9. [Testing](#testing)
10. [Design Choices](#design-choices)
11. [Future Enhancements](#future-enhancements)
12. [Dependencies](#dependencies)
13. [Contributors](#contributors)
14. [License](#license)

---

## Project Overview
This project is a three-tier rule engine application that evaluates user eligibility based on configurable rules such as age, department, income, experience, and other attributes. The system uses an Abstract Syntax Tree (AST) to represent conditional rules, allowing for dynamic creation, combination, and evaluation of these rules. The application includes a frontend UI, backend API, and a data storage solution.

## Features
- **Rule Creation**: Users can create rules using logical operators and conditional expressions.
- **Rule Combination**: Multiple rules can be combined into a single rule.
- **Rule Evaluation**: Evaluate user eligibility based on rule logic against user data.
- **Dynamic Rule Modifications**: Change and re-evaluate rules on-the-fly.
- **Responsive UI**: Optimized for both desktop and mobile views.

## Technologies Used
- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Data Structure
Each rule is represented in an AST format:
- **Node Structure**:
  - `type`: Indicates the node type ("operator" for AND/OR, "operand" for conditions).
  - `left`: Reference to another Node (left child).
  - `right`: Reference to another Node (right child for operators).
  - `value`: Contains the value for operand nodes (e.g., number for comparisons).
  
This structure allows efficient rule storage, modification, and evaluation.

## Sample Rules
### Example Rule Syntax
1. `rule1`: `((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)`
2. `rule2`: `((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)`

## Project Setup
1. **Clone the Repository**:
   ```bash
   git clone <https://github.com/NeetuShaw/Rule-Engine-with-AST.git>
   cd RuleEngine

2. Backend Setup:

- Ensure Node.js is installed on your machine.
- In the root Rule-Engine directory, install backend dependencies:

npm install

3. Frontend Setup:

- Navigate to the frontend directory and install frontend dependencies:

 cd frontend
 npm install

4. Run the Application:

- Start the backend server from the root directory:
npm start

- Start the frontend server from the frontend directory:
 npm start


5. Database:

- If you wish to use MongoDB, set up a MongoDB instance and add the connection string in your backend configuration.

API Design

1. Create Rule (POST /rules/create): Accepts a rule string and converts it into an AST.
2. Combine Rules (POST /rules/combine): Accepts multiple rules and combines them into a single AST.
3. Evaluate Rule (POST /rules/evaluate_rule): Takes a JSON representing attributes (e.g., { "age": 35, "department": "Sales" }) and evaluates the data against the rule’s AST.

Usage
- Creating a Rule: Use the frontend UI to create rules or send a      request to /rules/create.

- Combining Rules: Combine multiple rules via the /rules/combine endpoint or UI interface.

- Evaluating a Rule: Provide attribute data in JSON format through /rules/evaluate_rule to check eligibility.

Example API Requests

1. Create Rule

POST /rules/create
Body: { "rule_string": "(age > 25) AND (department = 'Sales')" }

2. Evaluate Rule

POST /rules/evaluate_rule
Body: { "ruleId": "<rule_id>", "data": {"age": 30, "department": "Sales"} }

3. Testing

- Individual Rule Creation: Test with create_rule endpoint and confirm AST representation.
- Rule Combination: Combine example rules and validate the combined logic.
- Evaluation: Use sample JSON data and test various conditions.

Design Choices
- AST-Based Structure: For efficient handling of complex logical rules.
- Modular API Design: Allows seamless addition or modification of rules.
- Optional Docker Setup: Docker can be used for ease of deployment, though this is optional for this project.

Future Enhancements
- Error Handling Improvements: Enhanced validations for more complex rule structures.
- User-Defined Functions: Extend rule language to support custom functions.
- Rule Analytics: Track rule evaluations for performance and accuracy insights.

Dependencies

- Node.js and Express for the backend server
- React for the frontend
- MongoDB for database storage 

Contributors
[Neetu Shaw]

License

This version should be easy to understand for other developers and provides a complete overview, installation instructions, and usage information for the project.





