"use strict";
// * Note: This implementation is based on the 128-bit flake id algorithm
// * developed by Boundary (github.com/boundary/flake) and implementations
// * I've written in other languages.
// * IMPORTANT: This implementation will require a custom epoch offset
// * in order to avoid the 2038 problem. The epoch offset *cannot* be
// * changed after the first id is generated in a given database.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBigIntIdProvider = getBigIntIdProvider;
exports.getBase62Provider = getBase62Provider;
exports.getBase36Provider = getBase36Provider;
exports.getBigIntIdProviderWithNodeId = getBigIntIdProviderWithNodeId;
exports.bigIntTo62 = bigIntTo62;
exports.bigIntTo36 = bigIntTo36;
const getmac_1 = __importDefault(require("getmac"));
const farmhash_1 = __importDefault(require("farmhash"));
const EPOCH = 1577862000000n; // 2020-01-01T00:00:00.000Z
// Returns a function that is guaranteed to return a unique bigint
// that will be k-ordered (time ordered) when compared to other ids
function getBigIntIdProvider(nodeIdentifier) {
    const nodeId = nodeIdentifier ? getNodeIdentifierAsBigInt(nodeIdentifier) : getMacAddressAsBigInt();
    return getBigIntIdProviderWithNodeId(nodeId);
}
// Returns a function that is guaranteed to return a unique base62 string
// that will lexicographically sort in k-order (time ordered) when compared to other ids
// nodeIdentifier is an optional arbitrary string that is hashed to create the node id portion
// if not provided, the host mac address will be used
function getBase62Provider(nodeIdentifier) {
    const idProvider = getBigIntIdProvider(nodeIdentifier);
    return () => bigIntTo62(idProvider());
}
// Returns a function that is guaranteed to return a unique base36 string
// that will lexicographically sort in k-order (time ordered) when compared to other ids
function getBase36Provider(nodeIdentifier) {
    const idProvider = getBigIntIdProvider(nodeIdentifier);
    return () => bigIntTo36(idProvider());
}
// Creates a unique bigint id that is k-ordered (time ordered) when compared to other ids
function getBigIntIdProviderWithNodeId(nodeIdentifier) {
    let lastTime = 0n;
    let iteration = 0n;
    return () => {
        const now = BigInt(Date.now()) - EPOCH;
        if (now === lastTime) {
            iteration++;
            if (iteration > 0xffffn) {
                throw new Error('Too many iterations in the same millisecond');
            }
        }
        else if (now < lastTime) {
            throw new Error('NTP clock skew detected');
        }
        else {
            lastTime = now;
            iteration = 0n;
        }
        return (lastTime << 64n) + (nodeIdentifier << 16n) + iteration;
    };
}
// Converts a bigint to a base62 string that will sort lexicographically
const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
function bigIntTo62(num) {
    let result = '';
    while (num > 0n) {
        result = `${BASE62_ALPHABET[Number(num % 62n)]}${result}`;
        num = num / 62n;
    }
    const len = 22 - result.length;
    for (let i = 0; i < len; i++) {
        result = `0${result}`;
    }
    return result;
}
// converts a bigint to a base36 string that will sort lexicographically
const BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function bigIntTo36(num) {
    let result = '';
    while (num > 0n) {
        result = `${BASE36_ALPHABET[Number(num % 36n)]}${result}`;
        num = num / 36n;
    }
    const len = 25 - result.length;
    for (let i = 0; i < len; i++) {
        result = `0${result}`;
    }
    return result;
}
// Converts the host's mac address to a big int for use in the 48 bit
// node id portion of the flake id
function getMacAddressAsBigInt() {
    return (0, getmac_1.default)()
        .split(':')
        .reduce((acc, octet, i) => {
        return acc + (BigInt(`0x${octet}`) << BigInt(i * 8));
    }, 0n);
}
// Take an arbitrary node identifier as a string, use farmhash to hash it to
// a 48 bit number for use in the node id portion of the flake id
function getNodeIdentifierAsBigInt(identifier) {
    return BigInt(farmhash_1.default.hash32(identifier) & 0x0000FFFFFFFFFFFF);
}
