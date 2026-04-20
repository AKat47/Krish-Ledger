// Generic CRUD router factory
// Usage: module.exports = crudRouter(Model)
const express = require('express');

function crudRouter(Model, populateFields = []) {
  const router = express.Router();

  // GET all
  router.get('/', async (req, res, next) => {
    try {
      let q = Model.find().sort({ createdAt: -1 });
      populateFields.forEach(f => { q = q.populate(f); });
      const docs = await q;
      res.json(docs);
    } catch (err) { next(err); }
  });

  // GET one
  router.get('/:id', async (req, res, next) => {
    try {
      let q = Model.findById(req.params.id);
      populateFields.forEach(f => { q = q.populate(f); });
      const doc = await q;
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err) { next(err); }
  });

  // POST create
  router.post('/', async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (err) { next(err); }
  });

  // PUT update
  router.put('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (err) { next(err); }
  });

  // DELETE
  router.delete('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true, id: req.params.id });
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = crudRouter;
