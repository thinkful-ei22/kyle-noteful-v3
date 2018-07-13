'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const router = express.Router;

/* ========== GET/READ ALL TAGS ========== */
router.get('/', (req, res, next) => {

});





module.exports = router;