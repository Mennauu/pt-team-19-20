const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  age: Number,
  gender: String,
  attraction: String,
  fromAge: Number,
  toAge: Number,
  avatar: String,
  images: [],
  firstVisit: Boolean,
  location: {
    latitude: Number,
    longitude: Number,
  },
  song: String,
  artist: String,
  genre: String,
  liked: [],
  disliked: [],
  matched: [],
})

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next()

  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10))

  return next()
})

userSchema.methods.validatePassword = (password, comparePassword) => {
  return bcrypt.compareSync(password, comparePassword)
}

module.exports = mongoose.model('User', userSchema)
