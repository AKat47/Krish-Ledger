const crudRouter = require('../middleware/crudRouter');
const { Expense } = require('../models');
module.exports = crudRouter(Expense);
