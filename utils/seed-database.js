'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Folder.createIndexes(),
      Tag.insertMany(seedTags),
      Tag.createIndexes()
    ]); 
  })
  .then(results => {
    // eslint-disable-next-line no-console
    console.info(`Inserted ${results[0].length} Notes`);
    console.info(`Inserted ${results[1].length} Folders`);
    console.info('Created Indexes on Folders');
    console.info(`Inserted ${results[3].length} Tags`);
    console.info('Created Indexes on Tags');
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
