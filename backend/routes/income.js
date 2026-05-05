const crudRouter = require('../middleware/crudRouter');
const { Income } = require('../models');
module.exports = crudRouter(Income);
