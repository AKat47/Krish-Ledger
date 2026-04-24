const express = require('express');

module.exports = function crudRouter(Model, populate = []) {
  const r = express.Router();

  r.get('/', async (req, res, next) => {
    try {
      let q = Model.find().sort({ createdAt: -1 });
      populate.forEach(f => { q = q.populate(f); });
      res.json(await q);
    } catch (e) { next(e); }
  });

  r.post('/', async (req, res, next) => {
    try { res.status(201).json(await Model.create(req.body)); }
    catch (e) { next(e); }
  });

  r.put('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: 'Not found' });
      res.json(doc);
    } catch (e) { next(e); }
  });

  r.delete('/:id', async (req, res, next) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e) { next(e); }
  });

  return r;
};
