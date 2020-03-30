import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const profile = async (req, res) => {
  const { id } = req.params
  const { username } = req.query
  if (req.user) {
    const avatar = '/assets/images/avatar.svg'
    await User.findOne({ _id: id, username: username }, async (err, results) => {
      if (err) return res.redirect('back')

      if (results) {
        console.log(req.user.matched)
        const matches = await User.find({ _id: { $in: req.user.matched } }, results => results)
        const matchName = matches.map(match => {
          const name = match.username
          return name
        })
        res.render('profile', {
          data: results,
          removeButton: matchName.includes(username) ? true : false,
          navigation: dataNavigation,
          username: req.user.username,
          avatar: req.user.avatar || avatar,
          name: req.user.name || req.user.username,
        })
      } else {
        const notificationMessage = req.flash('error')[0]
        res.render('profile', {
          data: results,
          navigation: dataNavigation,
          username: req.user.username,
          name: req.user.name || req.user.username,
          notificationMessage,
        })
      }
    })
  } else {
    res.redirect('/login')
  }
}
