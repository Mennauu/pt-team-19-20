import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const profile = async (req, res) => {
  const { id } = req.params
  const { username } = req.query
  if (!req.user) {
    res.redirect('/login')
  } else {
    let profile
    const avatar = '/assets/images/avatar.svg'
    try {
      profile = await User.findOne({ _id: id, username: username })
    } catch (e) {
      res.redirect('back')
    }

    if (profile) {
      const matches = await User.find({ _id: { $in: req.user.matched } })
      const matchName = matches.map(match => {
        const name = match.username
        return name
      })
      res.render('profile', {
        data: profile,
        removeButton: matchName.includes(username) ? true : false,
        isAuthenticated: req.user.id === id ? true : false,
        navigation: dataNavigation,
        authenticated: true,
        id: req.user.id,
        username: req.user.username,
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
