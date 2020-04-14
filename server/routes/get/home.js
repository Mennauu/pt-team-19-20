import rangeInclusive from 'range-inclusive'

import genres from '../../data/genres.json'
import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const home = async (req, res) => {
  if (req.user) {
    const avatar = '/assets/images/avatar.svg'

    if (!req.user.firstVisit) {
      const fromAge = req.user.fromAge
      const toAge = req.user.toAge
      const allowedAges = rangeInclusive(fromAge, toAge, 1)
      let attraction = req.user.attraction

      switch (attraction) {
        case 'Males':
          attraction = 'Male'
          break
        case 'Females':
          attraction = 'Female'
          break
        default:
          attraction = 'Any'
      }

      await User.find({ age: allowedAges, gender: attraction }, async (err, results) => {
        if (err) return res.redirect('back')

        if (results) {
          const filteredResults = results.filter(
            match => !req.user.liked.includes(match._id) && !req.user.disliked.includes(match._id),
          )
          const deg2rad = deg => deg * (Math.PI / 180)
          const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
            const R = 6371 // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1) // deg2rad below
            const dLon = deg2rad(lon2 - lon1)
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const d = R * c // Distance in km
            return Math.round(Number(d.toFixed(1)) + 1)
          }

          const persons = filterAllData(filteredResults)

          const convertedPersons = persons.map(their => {
            const obj = their
            const newDistance = () => {
              const { latitude: yourLat, longitude: yourLong } = req.user.location
              const { latitude: theirLat, longitude: theirLong } = their.location
              return getDistanceFromLatLonInKm(yourLat, yourLong, theirLat, theirLong)
            }
            obj.location = newDistance()
            return obj
          })

          const compare = (a, b) => {
            if (a.location < b.location) {
              return -1
            }
            if (a.location > b.location) {
              return 1
            }
            return 0
          }

          convertedPersons.sort(compare)

          const matches = await User.find({ _id: { $in: req.user.matched } }, results => results)

          const matchedUser = req.flash('matcheduser')[0]
          const matchedAvatar = req.flash('matchedavatar')[0]

          res.render('home', {
            navigation: dataNavigation,
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar || avatar,
            authenticated: true,
            firstvisit: req.user.firstVisit,
            name: req.user.name || req.user.username,
            possibleMatches: convertedPersons,
            matched: matches || [],
            matcheduser: matchedUser,
            matchedavatar: matchedAvatar,
          })
        }
      })
    } else {
      const notificationMessage = req.flash('error')[0]

      res.render('home', {
        navigation: dataNavigation,
        username: req.user.username,
        avatar: req.user.avatar || avatar,
        authenticated: true,
        firstvisit: req.user.firstVisit,
        name: req.user.name || req.user.username,
        notificationMessage,
        genres,
      })
    }
  } else {
    res.redirect('/login')
  }
}

const filterAllData = data => {
  return data.map(filterSingleData)
}

const filterSingleData = ({ _id, username, avatar, age, gender, location, genre }) => {
  return {
    id: _id,
    username,
    avatar,
    age,
    gender,
    genre,
    location,
  }
}
