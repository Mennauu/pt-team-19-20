import cityLocations from '../../data/cityLocations.json'

// converts input to Uppercase first word letters
function upperCaseCorrection(input) {
  const newInput = input
    .toLowerCase()
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')

  return newInput
}

// search for perfect matching value
function findExactCityData(value) {
  return cityLocations.find(item => item.woonplaats === value)
}

// search for multiple matching values
function findFilteredCityData(value) {
  return cityLocations.filter(item => item.woonplaats.includes(value))
}

export const userLocation = (req, res) => {
  console.log('/userLocation')
  const { userInput } = req.body
  let newLocation

  // if user wants to delete their database data
  if (req.body.userSuggestion === 'removeLocation') {
    newLocation = {
      location: {
        latitude: '',
        longitude: '',
        timestamp: Date.now(),
      },
    }
    console.log(newLocation)
  } else {
    // search for 1 specific value

    if (findExactCityData(upperCaseCorrection(userInput))) {
      const { latitude: userLat, longitude: userLong } = findExactCityData(
        upperCaseCorrection(userInput),
      )

      newLocation = {
        location: {
          latitude: userLat,
          longitude: userLong,
          timestamp: Date.now(),
        },
      }
    } else {
      const possibleSuggestions = findFilteredCityData(upperCaseCorrection(userInput))

      if (possibleSuggestions.length === 0) {
        console.log(`We can not suggest you something with the input ${userInput}`)
      } else {
        const maxFiveSuggestions = possibleSuggestions.slice(0, 5)
        // render max five suggestions in location feature
        console.log(maxFiveSuggestions)
      }
    }

    console.log(newLocation)

    res.redirect('back')
  }
}
