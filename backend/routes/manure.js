const crudRouter = require('../middleware/crudRouter');
const { Manure } = require('../models');
module.exports = crudRouter(Manure);