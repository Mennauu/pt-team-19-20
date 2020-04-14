import dataNavigation from '../../data/navigation.json'
import Festivals from '../../database/models/festival.js'
import User from '../../database/models/user.js'

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
      res.render('profile', {
        data: profile,
        removeButton: matchName.includes(username) ? true : false,
        isAuthenticated: req.user.id === id ? true : false,
        navigation: dataNavigation,
        authenticated: true,
        id: req.user.id,
        username: req.user.username,
        festivals: await festivals(),
        avatar: req.user.avatar || avatar,
        name: req.user.name || req.user.username,
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
