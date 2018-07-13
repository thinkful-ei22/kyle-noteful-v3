'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const mongo = require('mongodb');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

mongoose.Promise = global.Promise;

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes Router', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders)
    ]);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/notes', function() {

    it('should return the correct number of Notes', function() {

      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields');

    it('should return correct search results for a searchTerm query');

    it('should return only notes in the correct folder when filtered by folder', function() {
      /** PLAN
       * 1. get a folder id from the db
       * 2. get all notes with that folderId from the db
       * 3. make a chai request and pass in the folderId in a queryString
       * 4. confirm the number of results is the same
       * 5. confirm each note from the chai req has the correct folderId
       */
      let sampleFolder;

      return Folder.findOne()
        .then(_data => {
          sampleFolder = _data;
          const folderQuery = `?folderId=${sampleFolder.id}`;

          return Promise.all([
            Note.find({ folderId: sampleFolder.id }),
            chai.request(app)
              .get(`/api/notes${folderQuery}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);

          res.body.forEach(item => {
            expect(item).to.be.an('object');
            expect(item.folderId).to.equal(sampleFolder.id);
          });
        });
    });

    it('should return an empty array for an incorrect query');

  });

  describe('GET /api/notes/:id', function() {

    it('should return correct notes', function() {
      let data;

      return Note.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'title', 'content','folderId', 'createdAt', 'updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(mongo.ObjectId(res.body.folderId)).to.eql(data.folderId);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid');

    it('should respond with a 404 for an id that does not exist');

  });

  describe('POST /api/notes', function() {

    it('should create and return a new item when provided valid data', function() {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;

      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

          return Note.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "title" field');

  });

  describe('PUT /api/notes/:id', function() {

    it('should update the note when provided valid data', function() {
      /** PLAN:
       * 1. get a note ID from the db
       * 2. make a PUT request for that ID with an update object
       * 3. check the server response against the update object
       * 4. get the new version of that note from the db
       * 5. check the db version against the server response
       */
      const updateObj = {
        'title': 'updated title',
        'content': 'updated content'
      };
      let data;
      let res;

      // 1. get a note ID from the db
      return Note.findOne()
        .then(_data => {
          data = _data;

          // 2. make a PUT request for that ID with an update object
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateObj)
            .then(_res => {
              res = _res;
              expect(res).to.have.status(200);
              expect(res).to.be.json;

              expect(res.body).to.be.an('object');
              expect(res.body).to.have.keys('id', 'title', 'content','folderId', 'createdAt', 'updatedAt');

              // 3. check the server response against the update object
              expect(res.body.id).to.equal(data.id);
              expect(res.body.title).to.equal(updateObj.title);
              expect(res.body.content).to.equal(updateObj.content);

              // 4. get the new version of that note from the db
              return Note.findById(res.body.id);
            })
            .then(_data => {
              data = _data;

              // 5. check the db version against the server response
              expect(res.body.id).to.equal(data.id);
              expect(res.body.title).to.equal(data.title);
              expect(res.body.content).to.equal(data.content);
              expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
              expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
            });
        });
        
    });

    it('should respond with status 400 and an error message when `id` is not valid');

    it('should respond with a 404 for an id that does not exist');

    it('should return an error when missing "title" field');

  });

  describe('DELETE /api/notes/:id', function() {

    it('should delete an existing document and respond with 204', function() {
      /** PLAN
       * 1. get an id from the db
       * 2. send a chai delete request to that id
       * 3. check that server responds with 204
       * 4. make a db request for the deleted id
       * 5. check that it's not there
       */
      let data;

      // 1. get an id from the db
      return Note.findOne()
        .then(_data => {
          data = _data;

          // 2. send a chai delete request to that id
          return chai.request(app)
            .delete(`/api/notes/${data.id}`);
        })
        .then(res => {
          // 3. check that server responds with 204
          expect(res).to.have.status(204);

          // 4. make a db request for the deleted id
          return Note.findById(data.id);
        })
        .then(result => {
          // 5. check that it's not there
          expect(result).to.be.null;
        });
    });

  });

});