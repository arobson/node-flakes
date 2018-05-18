const chai = require('chai');
chai.should();
const path = require('path');
const _ = require('lodash');

describe('when starting up without a seed', function () {
  var flake;
  before(async function () {
    flake = await require('../src/index.js')();
    return flake.seedFromEnvironment();
  });

  it('should seed from MAC Address', function () {
    flake.seed.length.should.equal(6);
  });

  it('should start with instance count of 1', function () {
    flake.index.should.equal(1);
  });

  describe('if requiring a new instance', function () {
    before(async function () {
      flake = await require('../src/index.js')();
    });

    it('should not create an additional instance', function () {
      flake.index.should.equal(1);
    });
  });

  describe('when getting an id', function () {
    var id;
    before(function () {
      id = flake.create();
    });

    it('should get a valid id', function () {
      id.length.should.equal(22);
    });
  });

  describe('when getting 10,000 ids', function () {
    let diff;
    let list = [];
    let idCount = 10000;
    this.timeout(10000);
    before(function () {
      const start = process.hrtime();
      for (let i = 0; i < idCount; i++) {
        list.push(flake.create());
        if (list.length === idCount) {
          diff = process.hrtime(start);
          diff = (diff[ 0 ] * 1e9 + diff[ 1 ]) / 1000000;
        }
      }
    });

    it('should produce only unique ids', function () {
      _.uniq(list).length.should.equal(idCount);
    });

    it('should average 15 ids/ms', function () {
      const perms = idCount / diff;
      console.log(`${perms}`);
      (perms).should.be.greaterThan(15);
    });
  });
});

describe('when starting with a seed', function () {
  let flake;
  before(function () {
    let flakePath = path.resolve('./src/index.js');
    delete require.cache[ flakePath ];
    flake = require('../src/index.js')('burple');
  });

  it('should seed from seed value', function () {
    flake.seed.length.should.equal(6);
  });

  it('should start with instance count of 1', function () {
    flake.index.should.equal(1);
  });
});
