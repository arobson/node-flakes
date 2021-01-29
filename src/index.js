const os = require('os');
const getMac = require('getmac').getMac;
const jump = require('basejump');
const farmhash = require('farmhash');
let instance;
let instanceCount = 0;

// 128 bit ids can generate up to
//          1    1    2    2    3    3   3
//     5    0    5    0    5    0    5   9
// 340282366920938463463374607431768211456
// unique ids.
// By base-62 encoding them, we can shorten the length of the id to 22 places

// via http://stackoverflow.com/questions/8482309/converting-javascript-integer-to-byte-array-and-back
function longToBytes (long) {
  // we want to represent the input as a 8-bytes array
  const byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = ((long - byte) / 256);
  }
  return byteArray.reverse();
}

async function getWorkerIdFromEnvironment () {
  return new Promise(resolve => {
    getMac((err, address) => {
      if (err) {
        address = os.hostname();
      }
      const bytes = getNodeBytesFromSeed(address);
      resolve(bytes);
    });
  });
}

function getNodeBytesFromSeed (seed) {
  const hash = farmhash.hash32(`${seed.toString()}|${process.pid}`);
  return longToBytes(hash).splice(2);
}

const Flake = function (seed) {
  this.lastMs = Date.now();
  this.msCounter = 0;
  this.msBytes = [0, 0];
  this.index = ++instanceCount;
  this.seed = seed;
};

Flake.prototype.create = function () {
  this.updateTime();
  const bytes = this.timestamp.concat(this.seed, this.msBytes).reverse();
  return jump.toBase62(bytes, 22);
};

Flake.prototype.seedFromEnvironment = async function () {
  this.seed = await getWorkerIdFromEnvironment();
};

Flake.prototype.updateTime = function () {
  const now = Date.now();
  let change = false;
  if (now < this.lastMs) {
    throw new Error('NTP is slewing system time backwards - node-flakes cannot issue ids while this is occurring.');
  } else if (now > this.lastMs) {
    change = true;
    this.msCounter = 0;
    this.msBytes = [0, 0];
    this.lastMs = now;
    this.timestamp = longToBytes(now);
  } else {
    this.msCounter++;
    this.msBytes = [0, 0].concat(longToBytes(this.msCounter)).splice(-2, 2);
  }
  return change;
};

module.exports = function (seed) {
  if (instance) {
    return instance;
  }
  instance = new Flake(seed);
  return instance;
};
