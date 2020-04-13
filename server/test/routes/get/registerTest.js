const assert = require('chai').assert
const register = require('../../../routes/routeHandler').register

describe('Register', () => {
  it('register should return hello', () => {
    assert.equal(register(), 'hello')
  })
})
