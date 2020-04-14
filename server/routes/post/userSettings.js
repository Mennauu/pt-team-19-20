const isImage = require('is-image')
import validator from 'validator'

import cityLocations from '../../data/cityLocations.json'
import message from '../../data/messages.json'
import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

const findExactCity = value => {
  return cityLocations.find(entry => entry.woonplaats === value)
}

const findMatchingCityResults = value => {
  return cityLocations.filter(item => item.woonplaats.includes(value))
}

export const userSettings = (req, res) => {
  const {
    name,
    age,
    gender,
    attraction,
    fromAge,
    toAge,
    level,
    inputLocation,
    inputSuggestion,
    geoLocation,
  } = req.body

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

  // Check if upload contains a valid image
  if (!req.file) {
    req.flash('error', message.setAvatar)

    return res.redirect('back')
  } else {
    if (!isImage(req.file.originalname)) {
      req.flash('error', message.setRealImage)

      return res.redirect('back')
    }
  }

  // Check if an attraction has been selected
  if (level === '') {
    req.flash('error', message.chooseLevel)

    return res.redirect('back')
  }

  if (inputLocation && !inputSuggestion && !geoLocation) {
    // Check if location contains letters, spaces, dashes and high comma only
    if (!validator.matches(inputLocation, /^[a-zA-Z\s'-]*$/)) {
      req.flash('error', message.locationPattern)
      return res.redirect('back')
    }

    // check if inputLocation is exact in cityLocations
    if (!findExactCity(inputLocation)) {
      const matchingResults = findMatchingCityResults(inputLocation)

      // Check if location has no matches
      if (!matchingResults.length) {
        // return this.errorHandler(message.locationMatchFail)
        req.flash('error', message.locationMatchFail)
        return res.redirect('back')
      } else {
        const maxFiveMatchingResults = matchingResults.slice(0, 5)

        res.render('home', {
          navigation: dataNavigation,
          username: req.user.username,
          authenticated: true,
          firstvisit: req.user.firstVisit,
          values: req.body,
          locationSuggestions: maxFiveMatchingResults,
        })
      }
    }
  }

  updateUserSettings(req, res)
}

const updateUserSettings = (req, res) => {
  const {
    name,
    age,
    gender,
    attraction,
    fromAge,
    toAge,
    level,
    inputLocation,
    inputSuggestion,
    geoLocation,
  } = req.body

  const location = () => {
    // GEO location
    if (geoLocation) {
      return JSON.parse(geoLocation)
    }
    // Suggested city location
    if (findExactCity(inputSuggestion)) {
      return {
        latitude: findExactCity(inputSuggestion).latitude,
        longitude: findExactCity(inputSuggestion).longitude,
      }
    }
    // Full city name location
    return {
      latitude: findExactCity(inputLocation).latitude,
      longitude: findExactCity(inputLocation).longitude,
    }
  }

  User.updateOne(
    { _id: req.session.passport.user },
    {
      _id: req.session.passport.user,
      name,
      age,
      gender,
      attraction,
      fromAge,
      toAge,
      avatar: `assets/uploads/${req.file.filename}`,
      level,
      location: location(),
      firstVisit: false,
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
