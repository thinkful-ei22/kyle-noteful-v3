'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

mongoose.Promise = global.Promise;

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders Router', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Folder.createIndexes(),
    ]);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/folders', function(){

    it('should return a list with the correct number of folders, each having the correct fields', function() {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);

          res.body.forEach(item => {
            expect(item).to.be.an('object');
            expect(item).to.have.keys(['id', 'name', 'createdAt', 'updatedAt']);
          });
        });
    });

  });

  describe('GET /api/folder/:id', function() {

    it('should return correct folders', function() {
      /** PLAN
       * 1. get a folder id from the db
       * 2. make an api request for that folder id
       * 3. confirm that the api response matches the data from the db
       */
      let data;

      // 1. get a folder id from the db
      return Folder.findOne()
        .then(_data => {
          data = _data;

          // 2. make an api request for that folder id
          return chai.request(app)
            .get(`/api/folders/${data.id}`);
        })
        .then(res => {
          // 3. confirm that the api response matches the data from the db
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys(['id', 'name', 'createdAt', 'updatedAt']);

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      /** PLAN
       * 1. set an invalid id
       * 2. make a chai request to the invalid id
       * 3. confirm that the response status is 400 and that there is a message
       */

      // 1. set an invalid id
      const invalidId = 'not-a-valid-id';

      // 2. make a chai request to the invalid id
      return chai.request(app)
        .get(`/api/folders/${invalidId}`)
        .then(res => {
          // 3. confirm that the response status is 400 and that there is a message
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      const nonExistantId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/folders/${nonExistantId}`)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });
  });

  describe('POST /api/folders', function() {

    it('should create and return a new folder when provided valid data', function() {
      const validData = {
        name: 'validName'
      };
      let res;

      return chai.request(app)
        .post('/api/folders')
        .send(validData)
        .then(_res => {
          res = _res;

          // validate res
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(['id', 'name', 'createdAt', 'updatedAt']);

          // make db request
          return Folder.findById(res.body.id);
        })
        .then(data => {
          // confirm post res & db match
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing `name` field', function() {
      const nameMissing = {
        wrong: 'missing name field'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(nameMissing)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });

    });

    it('should return an error when the `name` field is not unique', function() {
      /** PLAN
       * 1. get the name of a folder from the db
       * 2. send a post request with that name
       * 3. confirm that the error was returned properly with 400 status
       */
      const helpfulResponse = 'The folder name already exists';

      return Folder.findOne()
        .then(data => {
          const duplicateName = {
            name: data.name
          };

          return chai.request(app)
            .post('/api/folders')
            .send(duplicateName); 
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');

          expect(res.body.message).to.equal(helpfulResponse);
        });

    });
  });

  describe('PUT /api/folder/:id', function() {

    it('should update the folder when provided valid data');

    it('should respond with status 400 and an error message when `id` is not valid');

    it('should respond with a 404 for an id that does not exist');

    it('should return an error when missing `title` field');

    it('should return an error when the `title` field is not unique');
  });

  describe('DELETE /api/folder/:id', function() {

    it('should delete an existing folder and respond with 204');

    it('should respond with status 400 and an error message when `id` is not valid');
  });
});