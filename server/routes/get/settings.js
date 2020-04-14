import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const settings = async (req, res) => {
  if (!req.user) {
    res.render('login')
  } else {
    let user
    const avatar = '/assets/images/avatar.svg'
    try {
      user = await User.findOne({ _id: req.user.id })
    } catch (e) {
      res.redirect('back')
    }

    if (user) {
      res.render('settings', {
        values: user,
        navigation: dataNavigation,
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar || avatar,
        name: req.user.name || req.user.username,
      })
    }
  }
}
