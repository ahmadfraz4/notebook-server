require('dotenv').config()
let User = require('../models/UserSchema')
let jwt = require('jsonwebtoken')
let authenticate = async (req,res,next) =>{
    try {
        let token = req.cookies.jwtToken;
        if(!token){
            return res.json({msg : 'Please Enable the cookies to access notes', msgType : 'error'})
        }
        let verifyToken = jwt.verify(token, process.env.SECRET_KEY)
        let rootUser = await User.findOne({_id:verifyToken._id, "tokens.token" : token})
        if(!rootUser){
            throw new Error('User not find')
        }
        req.user = rootUser;
        req.token = token
        next();
    } catch (error) {
        res.status(401).json({msg : 'UnAutherized User', msgType : 'error'})
    }
}
module.exports = authenticate