import dataNavigation from '../../data/navigation.json'
import Festivals from '../../database/models/festival.js'
import User from '../../database/models/user.js'
import genres from '../../data/genres.json'

export const profile = async (req, res) => {
  const { id } = req.params
  const { username } = req.query
  if (!req.user) {
    res.redirect('/login')
  } else {
    let profile
    const avatar = '/assets/images/avatar.svg'
    const loggedInUser = await User.findById(req.session.passport.user)
    try {
      profile = await User.findOne({ _id: id, username: username })
    } catch (e) {
      res.redirect('back')
    }

    if (profile) {
      const bothLikeSameGenre = profile.genre === loggedInUser.genre
      const festivals = async () => {
        if (!bothLikeSameGenre) {
          return null
        }
        const data = await Festivals.findOne({})
        return data.festivals.filter(user => user.genre === profile.genre)
      }
      const matches = await User.find({ _id: { $in: req.user.matched } })
      const matchName = matches.map(match => match.username)

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

      const newDistance = () => {
        const { latitude: yourLat, longitude: yourLong } = loggedInUser.location
        const { latitude: theirLat, longitude: theirLong } = profile.location
        return getDistanceFromLatLonInKm(yourLat, yourLong, theirLat, theirLong)
      }

      res.render('profile', {
        data: profile,
        removeButton: matchName.includes(username) ? true : false,
        isAuthenticated: req.user.id === id ? true : false,
        navigation: dataNavigation,
        authenticated: true,
        id: req.user.id,
        username: req.user.username,
        festivals: await festivals(),
        distance: `${newDistance()}km`,
        avatar: req.user.avatar || avatar,
        name: req.user.name || req.user.username,
        genres,
      })
    } else {
      const notificationMessage = req.flash('error')[0]
      res.render('profile', {
        data: profile,
        navigation: dataNavigation,
        username: req.user.username,
        name: req.user.name || req.user.username,
        notificationMessage,
      })
    }
  }
}
