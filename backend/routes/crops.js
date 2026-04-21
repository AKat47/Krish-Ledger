const crudRouter = require('../middleware/crudRouter');
const { Crop } = require('../models');
module.exports = crudRouter(Crop);