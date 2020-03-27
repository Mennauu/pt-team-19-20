import dataNavigation from '../../data/navigation.json'
import User from '../../database/models/user.js'

export const detail = async (req, res) => {
  const { username } = req.params
  console.log(username)
  if (req.user) {
    const avatar = '/assets/images/avatar.svg'
    await User.findOne({ username: username }, async (err, results) => {
      if (err) return res.redirect('back')

      if (results) {
        console.log(results)

        res.render('detail', {
          data: results,
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
