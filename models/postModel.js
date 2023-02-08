const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    description:{
        type:String
    },
    image:{
        type:String,
        required:[true,"image is required"]
    },
    public_image_id:{
        type:String,
        required:[true,"public_image_id is required"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    like:[{

        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
    }],
    comment:[{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          message:{
            type: String,
            required: [true,"Please write the comment"],
          }
    }],
    createdAt:{
        type:String
    },
    lastUpdateAt:{
        type:String
    }
})

module.exports = mongoose.model("Post",postSchema);