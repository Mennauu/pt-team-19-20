import User from '../../database/models/user.js'

export const removeMatch = (req, res) => {
  const { matchID } = req.body
  User.updateOne(
    { _id: req.session.passport.user },
    { $pull: { matched: matchID }, $addToSet: { disliked: matchID } },
    (err, succes) => {
      if (err) return res.redirect('back')
      if (succes) {
        User.updateOne(
          { _id: matchID },
          {
            $pull: { matched: req.session.passport.user },
            $addToSet: { disliked: req.session.passport.user },
          },
          (err, done) => {
            if (err) return res.redirect('back')
            if (done) {
              res.redirect('home')
            }
          },
        )
      }
    },
  )
}
