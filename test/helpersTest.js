const assert = require('chai').assert;

const { generateRandomString } = require('../helpers');

describe('generateRandomString', function() {
  it('should return a string that is 6 characters long', function() {
    const string = generateRandomString();
    assert.equal(string.length, 6);
  });
  it('should return a string with alphanumeric characters', function() {
    const string = generateRandomString();
    const myRegEx  = /^[a-z0-9]+$/i;
    assert.equal(myRegEx.test(string), true);
  });
});