const assert = require('chai').assert
const register = require('../../../routes/routeHandler.js').register

describe('Register', () => {
  it('register should render register', () => {
    assert.equal(register(), 200)
  })
})
