'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Folder = require('../models/folder');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  Folder.find()
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    next(err);
  }

  Folder.findById(id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
      
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE A SINGLE ITEM ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = {
    name
  };

  Folder.create(newFolder)
    .then(response => {
      res.location(`http://${req.headers.host}/folders/${response.id}`)
        .status(201)
        .json(response);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */



/* ========== DELETE/REMOVE A SINGLE ITEM ========== */


module.exports = router;