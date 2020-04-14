import validator from 'validator'

import message from '../../data/messages.json'
import User from '../../database/models/user.js'

export const updateProfile = (req, res) => {
  const { name, age, gender, attraction, fromAge, toAge, song, artist, genre } = req.body

  // Validate name length
  if (!validator.isByteLength(name, { min: 2, max: 256 })) {
    req.flash('error', message.nameCheck)
    return res.redirect('back')
  }
  // Check if name contains only letters
  if (!validator.isAlpha(name)) {
    req.flash('error', message.nameLetters)
    return res.redirect('back')
  }
  // Validate age length
  if (!validator.isByteLength(age, { min: 2, max: 2 })) {
    req.flash('error', message.ageCheck)
    return res.redirect('back')
  }
  // Check if age contains only letters
  if (!validator.isNumeric(age)) {
    req.flash('error', message.ageLetters)
    return res.redirect('back')
  }
  // Check if fromAge contains only letters, is above 18, and below 99
  if (!validator.isNumeric(fromAge) && fromAge < 18 && fromAge > 99) {
    req.flash('error', message.minAge)
    return res.redirect('back')
  }
  // Check if toAge contains only letters, is above 18, and below 99
  if (!validator.isNumeric(toAge) && toAge < 18 && toAge > 99) {
    req.flash('error', message.maxAge)
    return res.redirect('back')
  }
  // Check if an gender has been selected
  if (gender === '') {
    req.flash('error', message.chooseGender)
    return res.redirect('back')
  }
  // Check if an attraction has been selected
  if (attraction === '') {
    req.flash('error', message.chooseAttraction)
    return res.redirect('back')
  }

  User.updateOne(
    { _id: req.user.id },
    {
      $set: {
        _id: req.user.id,
        name,
        age,
        gender,
        attraction,
        fromAge,
        toAge,
        song,
        artist,
        genre,
      },
    },
    (err, result) => {
      if (err) {
        req.flash('error', message.userSettingsFail)
        return res.redirect('back')
      }
      if (result) {
        req.flash('error', message.userSettingsSuccess)
        return res.redirect('back')
      }
    },
  )
}
