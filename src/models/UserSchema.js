let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let userSchema = mongoose.Schema({
  name: {
    type : String,
    required : true
  },
  email: {
    type : String,
    required : true,
    uniqued : true
  },
  password: {type:String, require:true},
  verified : {
    type : Boolean,
    default : false
  },
  tokens: [
    {
      token: String, // we use array of object because user will login multiple times and every time new token will be generate
      
    },
  ],

});

userSchema.pre("save", async function (next) {
  // here save means before the saving sata
  if (this.isModified("password")) {
    // it means only perform hashing if password is modify or do somthing
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.methods.createToken = async function () {
  try {
    let myToken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: myToken });
    await this.save();
    return myToken;
  } catch (error) {
    console.log(error);
  }
};

let User = mongoose.model("user", userSchema);

module.exports = User;
