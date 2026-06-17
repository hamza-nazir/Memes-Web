const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../model/user');



router.get('/auth/google', (req, res, next) => {
  const state = req.query.state || '/';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    state: state  
  })(req, res, next);
});





router.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  (req, res) => {
    const redirectTo = req.query.state || '/';
  res.redirect(`${process.env.FRONT_END}${redirectTo}`);
  }
);





router.post('/signup', async (req, res, next) => {
  try {
    const { username, fullName, password, email } = req.body;
    const user = await User.register({ username, fullName, email }, password);
    req.login(user, (err) => {
      if (err) return next(err);
      const safeUser = { _id: user.id, fullName: user.fullName, username: user.username,email: user.email};
      return res.json({message: "Signup successful & logged in",user: safeUser }) });
  } catch (err) {
    return res.json({ error: err.message });
  }
});





router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.json({ error: err.message });
    }
    if (!user) {
      return res.json({ error: "Invalid username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.json({ error: err.message });
      }
      const safeUser = {_id: user.id,fullName:user.fullName,username: user.username, email: user.email };
      return res.json({message: "Login successful",user: safeUser})});
  })(req, res, next);
});





router.get('/current-user',(req,res)=>{
  if(!req.user){
    return res.json({user:null})
  }

  const safeUser={
    _id:req.user.id,
    fullName:req.user.fullName,
    username:req.user.username,
    email:req.user.email
  }

  res.json({user:safeUser})
})




router.get('/logout', (req, res) => {
  if(req.user){
    req.logout(() => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({success:true})
      });
    });
  }
});

module.exports=router