const crudRouter = require('../middleware/crudRouter');
const { Material } = require('../models');
module.exports = crudRouter(Material);
