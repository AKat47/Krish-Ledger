const crudRouter = require('../middleware/crudRouter');
const { Input } = require('../models');
module.exports = crudRouter(Input);
