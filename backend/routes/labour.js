const crudRouter = require('../middleware/crudRouter');
const { Labour } = require('../models');
module.exports = crudRouter(Labour, ['cropId']);
