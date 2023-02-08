const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is mandatory for Signup"]
    },
    email:{
        type:String,
        required:[true,"Email is mandatory for Signup"]
    },
    password:{
        type:String,
        select: false,
        required:[true,"Password is mandatory for Signup"]
    }
})

module.exports = mongoose.model("User",userSchema);