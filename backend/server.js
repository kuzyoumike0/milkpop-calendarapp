const express = require('express')
const session = require('express-session')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(session({ secret:'milkpop-secret',resave:false,saveUninitialized:true }))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user,done)=>done(null,user))
passport.deserializeUser((obj,done)=>done(null,obj))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
  callbackURL: "/auth/google/callback"
},(accessToken,refreshToken,profile,done)=>{
  return done(null,{ id:profile.id, email:profile.emails[0].value })
}))

app.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))
app.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{res.redirect('/')})
app.get('/auth/logout',(req,res)=>{req.logout(()=>{res.redirect('/login')})})

app.get('/api/me',(req,res)=>{
  if(req.user) return res.json({loggedIn:true,email:req.user.email})
  res.json({loggedIn:false})
})

app.post('/api/share',(req,res)=>{
  if(!req.user) return res.status(401).json({error:"unauthorized"})
  const token = uuidv4()
  res.json({url:`/share/${token}`})
})

app.use(express.static(path.join(__dirname,"../frontend/dist")))
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/dist/index.html"))
})

app.listen(PORT,()=>console.log("Server running on port",PORT))