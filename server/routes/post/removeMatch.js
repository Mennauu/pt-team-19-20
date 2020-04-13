import User from '../../database/models/user.js'

export const removeMatch = (req, res) => {
  const { matchID } = req.body

  User.findOne({ _id: matchID }, (err, person) => {
    if (req.xhr) {
      if (err) res.redirect('back')
      if (person) {
        const clientData = {
          username: person.username,
          avatar: person.avatar,
        }
        deleteFromMatches()
        return res.send(JSON.stringify(clientData))
      }
    } else {
      req.flash('matchedavatar', person.avatar)
      req.flash('matcheduser', person.username)
      deleteFromMatches()
      res.redirect('home')
    }
  })

  const deleteFromMatches = async () => {
    try {
      await User.updateOne(
        { _id: req.session.passport.user },
        { $pull: { matched: matchID }, $addToSet: { disliked: matchID } },
      )
      await User.updateOne(
        { _id: matchID },
        {
          $pull: { matched: req.session.passport.user },
          $addToSet: { disliked: req.session.passport.user },
        },
      )
    } catch (err) {
      res.redirect('back')
    }
  }
}
