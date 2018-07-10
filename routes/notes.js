'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      let filter = {};

      if (searchTerm) {
        filter.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
    })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {

      return Note.findById(id);
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  const newNote = {
    title,
    content
  };

  /***** Never trust users - validate input *****/
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {

      return Note.create(newNote);
    })
    .then(response => {
      res.location(`http://${req.headers.host}/notes/${response.id}`).status(201).json(response);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      const options = { new: true };
      const updateObj = { $set: toUpdate };

      return Note.findByIdAndUpdate(id, updateObj, options);
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      return Note.findByIdAndRemove(id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });


  // console.log('Delete a Note');
  // res.status(204).end();
});

module.exports = router;