require("dotenv").config();

let express = require("express");
let router = express.Router();
let User = require("../models/UserSchema");
let bcrypt = require("bcryptjs");
let jwt = require('jsonwebtoken')
let nodemailer = require('nodemailer')
const authenticate = require("../middleware/authenticate");
let sendgridTransport = require('nodemailer-sendgrid-transport')
let urlport = 'https://notebook-server-production.up.railway.app' || 3000
router.post("/createUser", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let addUser = new User({
      name,
      email,
      password,
    });
    let UserExist =await User.findOne({email :req.body.email})
    if(UserExist){
      return res.status(400).json({msg:'User Already Exist', msgType:'error'})
    }
    
    let storing = await addUser.save();
    let registerToken =await storing.createToken();
    
    const token = jwt.sign({ _id: storing._id.toString() }, process.env.SECRET_KEY);
    mailSender.sendMail({
      to : req.body.email,
      from : "ahmad.dev47@gmail.com",
      subject : `iNoteBook Email verification`,
      html : `<p>Hi ${req.body.name} <a href="${urlport}/verify?token=${token}">click here</a> to verify you email for iNoteBook<p>`
    }) 
    
    res.status(200).json({ msg: "A Verification Email send to you", msgType: "success" });
  } catch (error) {
    res.status(400).json({ msg: error, msgType: "error" });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    let token;
    let userData = await User.findOne({ email: req.body.email });
    if (userData) {
      let isMatch = await bcrypt.compare(req.body.password, userData.password);
      let isVerified =  userData.verified == true
  
      if (isMatch) {
        token = await userData.createToken();
        res.cookie('jwtToken', token, {
            httpOnly: true,
            domain: 'notebook-server-production.up.railway.app',
            secure: true, // Make sure this is set when running over HTTPS
            sameSite: 'None',
            path: '/',
          });
          
        if(isVerified){
          res.status(200).json({ msg: 'Login Successfullly', msgType: "success" });
        }else if(!isVerified){
          let tokenForVerification = jwt.sign({_id : userData._id.toString()}, process.env.SECRET_KEY)
           mailSender.sendMail({
            to : req.body.email,
            from : "ahmad.dev47@gmail.com",
            subject : `Email verification`,
            html : `<p>Hi ${userData.name} <a href="${urlport}/verify?token=${tokenForVerification}">click here</a> to verify you email<p>`
          }) 
          res.status(401).json({ msg: `A Link has sent to "${req.body.email}" .Please Verify Email First`, msgType: "info" });
        }
      } else {
        res.status(401).json({ msg: "Wrong email or passsword", msgType: "error" });
      }
    } else {
      res.status(404).json({ msg: "Email not exist", msgType: "error" });
    }
  } catch (error) {
    res.status(400).json({ msg: error, msgType: "error" });
  }
});
router.get('/verify', async (req, res) => {
  try {
    // Extract the verification token from the request query
    const token = req.query.token;
    console.log(token)
    if (!token) {
      return res.status(400).json({ msg: 'Invalid verification token', msgType: 'error' });
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Find the user in the database based on the decoded user ID
    const user = await User.findById({_id : decoded._id});
    if (!user) {
      return res.status(404).json({ msg: 'User not found', msgType: 'error' });
    }
    // Mark the user as verified
    user.verified = true;
     res.cookie('jwtToken', token, {
            httpOnly: true,
            domain: 'notebook-server-production.up.railway.app',
            secure: true, // Make sure this is set when running over HTTPS
            sameSite: 'None',
            path: '/',
      });
    await user.save();
    res.redirect(`${process.env.FRONTEND_PATH}/login`);
  } catch (error) {
    res.status(500).json({ msg: error.message, msgType: 'error' });
  }
});
router.post('/logout',async (req,res)=>{
  try {
    res.clearCookie('jwtToken', {
      path: '/',
      domain: 'notebook-server-production.up.railway.app',
      secure: true,
      httpOnly: true,
      sameSite: 'None',
    });
    
    res.status(200).json({ msg: 'Logout successful', msgType: 'success' });
  } catch (error) {
    res.status(400).json({msg:error , msgType:'error'})
  }
})
let mailSender = nodemailer.createTransport(sendgridTransport({
  auth : {
    api_key : process.env.SEND_GRID,
  },
}))
router.get('/about',authenticate,async (req,res)=>{
  try {
      let {name,email, _id, verified} = req.user;
      let token = req.cookies.jwtToken;
    
      if(verified && token){
        res.send({name, email , _id})
      }
    } catch (error) {
      res.json({msg: error , msgType : 'error'})
    }
})
module.exports = router;
