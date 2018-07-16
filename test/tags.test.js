'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

mongoose.Promise = global.Promise;

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tags Router', function() {

  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([
      Note.insertMany(seedNotes),
      Folder.insertMany(seedFolders),
      Folder.createIndexes(),
      Tag.insertMany(seedTags),
      Tag.createIndexes()
    ]);
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  const validTagKeys = ['id', 'name', 'createdAt', 'updatedAt'];
  const validData = { name: 'validName' };
  const invalidId = 'not-a-valid-id';
  const nonExistantId = 'DOESNOTEXIST';
  const nameMissing = { wrong: 'missing name field' };
  const helpfulResponse = 'The tag name already exists';

  describe('GET /api/tags', function() {

    it('should return a list with the correct number of tags', function() {
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return an array of objects with the correct fields', function() {
      return chai.request(app)
        .get('/api/tags')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('array');

          res.body.forEach(item => {
            expect(item).to.be.an('object');
            expect(item).to.have.keys(validTagKeys);
          });
        });
    });

  });

  describe('GET /api/tags/:id', function() {

    it('should return correct tags', function() {

      let data;

      return Tag.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .get(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(validTagKeys);

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      
      return chai.request(app)
        .get(`/api/tags/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {

      return chai.request(app)
        .get(`/api/tags/${nonExistantId}`)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

  });

  describe('POST /api/tags', function() {

    it('should create and return a new tag when provided valid data', function() {

      let res;

      return chai.request(app)
        .post('/api/tags')
        .send(validData)
        .then(_res => {
          res = _res;

          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(validTagKeys);

          return Tag.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing `name` field', function() {

      return chai.request(app)
        .post('/api/tags')
        .send(nameMissing)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should return an error when the `name` field is not unique', function() {

      return Tag.findOne()
        .then(data => {
          const duplicateName = {
            name: data.name
          };

          return chai.request(app)
            .post('/api/tags')
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

  describe('PUT /api/tags/:id', function() {

    it('should update the tag when provided valid data', function() {

      let data;
      let res;

      return Tag.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(validData);
        })
        .then(_res => {
          res = _res;

          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(validTagKeys);

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(validData.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.be.greaterThan(data.updatedAt);

          return Tag.findById(data.id);
        })
        .then(_data => {
          data = _data;

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    
    it('should respond with status 400 and an error message when `id` is not valid', function() {

      return chai.request(app)
        .put(`/api/tags/${invalidId}`)
        .send(validData)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {

      return chai.request(app)
        .put(`/api/tags/${nonExistantId}`)
        .send(validData)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should return a 400 error when missing `name` field', function() {

      return Tag.findOne()
        .then(data => {

          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(nameMissing);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });

    it('should return an error when the `name` field is not unique', function() {

      return Tag.find()
        .then(data => {
          const duplicateName = {
            name: data[0].name
          };

          return chai.request(app)
            .put(`/api/tags/${data[1].id}`)
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

  describe('DELETE /api/tags/:id', function() {

    it('should delete an existing tag and respond with 204', function() {

      let data;

      return Tag.findOne()
        .then(_data => {
          data = _data;

          return chai.request(app)
            .delete(`/api/tags/${data.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);

          return Folder.findById(data.id);
        })
        .then(result => {
          expect(result).to.be.null;
        });
    });

    it('should remove the matching tagId from corresponding notes', function() {
      /** PLAN
       * 1. get a tag id from the db
       * 2. get a count of all notes in the db
       * 2. get a count of notes with that tagId
       * 3. confirm the taggedNotes count is > 0
       * 4. make a chai del request with that tagId
       * 5. get a count of all notes in the db
       * 5. get a count of notes with that tagId
       * 6. confirm the total count has not changed
       * 6. confirm the count of notes with tagId is 0
       */

      let sampleTag;
      let startingCount;

      // 1. get a tag id from the db
      return Tag.findOne()
        .then(_data => {
          sampleTag = _data;

          // 2. get a count of all notes in the db
          // 2. get a count of notes with that tagId
          return Promise.all([
            Note.countDocuments(),
            Note.find({ tags: sampleTag.id }).countDocuments()
          ]);
        })
        .then(([_total, tagNotes]) => {
          startingCount = _total;

          // 3. confirm the taggedNotes count is > 0
          expect(startingCount).to.be.a('number');
          expect(tagNotes).to.be.a('number');
          expect(startingCount).to.be.greaterThan(0);
          expect(tagNotes).to.be.greaterThan(0);

          // 4. make a chai del request with that tagId
          return chai.request(app)
            .delete(`/api/tags/${sampleTag.id}`);
        })
        .then(() => {
          // 5. get a count of all notes in the db
          // 5. get a count of notes with that tagId
          return Promise.all([
            Note.countDocuments(),
            Note.find({ tags: sampleTag.id }).countDocuments()
          ]);
        })
        .then(([finalCount, tagNotes]) => {
          expect(finalCount).to.equal(startingCount);
          expect(tagNotes).to.be.a('number');
          expect(tagNotes).to.equal(0);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      
      return chai.request(app)
        .delete(`/api/tags/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.include.key('message');
        });
    });
  });
});

