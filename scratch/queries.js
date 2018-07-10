'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');



// // Find/Search for notes using `Note.find`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true } )
//   .then(() => {
//     const searchTerm = 'Lady Gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.$or = [
//         { title: { $regex: searchTerm } },
//         { content: { $regex: searchTerm } }
//       ];
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log('========== SEARCH USING Note.find ==========');
//     console.log(results);
//     console.log('=================== END ====================');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });



// // Find note by id using `Note.findById`
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000006';

//     return Note.findById(id);
//   })
//   .then(result => {
//     console.log('========== FIND NOTE USING Note.findById ==========');
//     console.log(result);
//     console.log('======================= END =======================');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });



// // Create a new note using `Note.create`
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const newNote = {
//       title: '5 reasons why my cat will eat your cat',
//       content: 'Because, reasons...'
//     };

//     return Note.create(newNote);
//   })
//   .then(result => {
//     console.log('========== CREATE NOTE USING Note.create ==========');
//     console.log(result);
//     console.log('======================= END =======================');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });



// // Update a note by id using `Note.findByIdAndUpdate`
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';
//     const updateObj = {
//       title: '9 ways cats can help you live to 99',
//       content: 'They can\'t actually help you. You\'re on your own.'
//     };
//     const options = { new: true };

//     return Note.findByIdAndUpdate(id, updateObj, options);
//   })
// .then(result => {
//   console.log('========== UPDATE NOTE USING Note.findByIdAndUpdate ==========');
//   console.log(result);
//   console.log('============================ END =============================');
// })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });



// // Delete a note by id using `Note.findByIdAndRemove`
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     const id = '000000000000000000000002';

//     return Note.findByIdAndRemove(id);
//   })
//   .then(result => {
//     console.log('========== DELETE NOTE USING Note.findByIdAndRemove ==========');
//     console.log(result);
//     console.log('============================ END =============================');
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
