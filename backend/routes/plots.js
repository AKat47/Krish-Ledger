const crudRouter = require('../middleware/crudRouter');
const { Plot } = require('../models');
module.exports = crudRouter(Plot);
