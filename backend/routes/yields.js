const crudRouter = require('../middleware/crudRouter');
const { Yield } = require('../models');
module.exports = crudRouter(Yield, ['cropId']);
