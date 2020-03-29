import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const detail = async (req, res) => {
  const { username } = req.params
  if (req.user) {
    const avatar = '/assets/images/avatar.svg'
    await User.findOne({ username: username }, async (err, results) => {
      if (err) return res.redirect('back')

      if (results) {
        const matches = await User.find({ _id: { $in: req.user.matched } }, results => results)
        const matchName = matches.map(match => {
          const name = match.username
          return name
        })
        res.render('detail', {
          data: results,
          removeButton: matchName[0] === username || !matchName === undefined ? true : false,
          navigation: dataNavigation,
          username: req.user.username,
          avatar: req.user.avatar || avatar,
          name: req.user.name || req.user.username,
        })
      } else {
        const notificationMessage = req.flash('error')[0]
        res.render('detail', {
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
