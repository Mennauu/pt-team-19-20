export const register = (req, res) => {
  if (req.user) {
    res.redirect('/home')
    return 'hello'
  } else {
    res.render('register', { error: req.flash('error'), firstvisit: true })
  }
}
