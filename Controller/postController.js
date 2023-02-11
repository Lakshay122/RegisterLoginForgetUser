const catchAsyncError = require("../middleware/catchAsyncError");
const Post  = require("../models/postModel");
const fs = require("fs");
const cloudinary = require("cloudinary");
const ErrorHander = require("../utils/errorHander");
const User = require("../models/userModel")
//cloud setup for post upload
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });


exports.getAllPost = catchAsyncError(async(req,res,next)=>{
    const post =  await Post.find();
    res.status(200).json({
        success:true,
        post:post
    })
})


//create the post 
exports.uploadPost = catchAsyncError(async(req,res,next)=>{
    req.body.user = req.user.id
    if (
        !req.files ||
        Object.keys(req.files).length === 0 ||
        Object.keys(req.files).length > 1
      ) {
        return next(new ErrorHander("please upload one image", 400));
      }
      const file = req.files.post;
      if(!file) return next(new ErrorHander("please upload one image",400))
      if (file.size > 20 * 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return next(new ErrorHander("post Size too large", 400));
      }

      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype != "video/mp4"  ) {
        removeTmp(file.tempFilePath);
    
        return next(new ErrorHander("File format is incorrect.", 400));
      }
  
      catchAsyncError( cloudinary.v2.uploader.upload(
        file.tempFilePath,
        { folder: "Post",resource_type: "video", resource_type:file.mimetype == "video/mp4" ?"video":"image",  },
        async (err, result) => {
          if (err) {
            console.log(err)
            return next(new ErrorHander(err, 400));
          }
          console.log(result);
         
          removeTmp(file.tempFilePath);
    
          req.body.public_image_id = result.public_id;
          req.body.image = result.secure_url;
           req.body.createdAt = Date(Date.now());
           req.body.lastUpdateAt = Date(Date.now());
          const post = await Post.create(req.body).then(()=>{
            res.status(201).json({
                success: true,
               message:"Post Uploaded Successfully"
              });
          }).catch((err)=>{
            return next(new ErrorHander(err,400));
          });
         
        }
      )
      )

})

//get single post
exports.getSinglePost = catchAsyncError(async(req,res,next) => {
    const {id} = req.params;

    const post = await Post.findById(id);

    if(!post){
        return next(new ErrorHander("Post Doesn't exits with given id"));
    }

    res.status(200).json({
        success:true,
        post:post
    })

})

//post of login user
exports.myPost = catchAsyncError(async(req,res,next) => {
    const post  = await Post.find({user:req.user.id})

    res.status(200).json({success:true,post:post})
})


//get the post of specific user
exports.userPost = catchAsyncError(async(req,res,next) => {
    
  const user = await User.findById(req.params.id);
  if(!user) return next(new ErrorHander("User Does'nt exists",404))
    const post  = await Post.find({user:req.params.id})

    res.status(200).json({success:true,post:post})
})


//update the description of the post
exports.updatePost = catchAsyncError(async(req,res,next) => {
    const post  = await Post.find({user:req.user.id,_id:req.params.id})
    if(!post) return next(new ErrorHander("Post does not exits"));
     
    const {description}  = req.body;
    if(!description) return next (new ErrorHander("Please give the update description"));

    await Post.findOneAndUpdate({user:req.user.id,_id:req.params.id},{$set:{description:description,lastUpdateAt:Date(Date.now())}});

    res.status(200).json({success:true,message:"Post update successfully"})
    
})

//delete the post
exports.deletePost = catchAsyncError(async(req,res,next) => {
    const {id} = req.params;

    const post = await Post.findOne({_id:id,user:req.user.id});

    if(!post){
        return next(new ErrorHander("this is not your post so your are not able to delete this"));
    }
    await post.remove();

    res.status(200).json({
        success:true,
        message:"Post deleted successfully"
    })

})

//get all the likes on specific post
exports.getAllLikes = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  const post = await Post.findById(id);

  if(!post) return next(new ErrorHander("'Post does not exits",400));

  res.status(200).json({
    success:true,
    like:post.like
  })
})

//like the post
exports.likePost = catchAsyncError(async(req,res,next)=>{
  const {id} = req.params;
    console.log(id)
  
  const post = await Post.findById(id);

  if(!post) return next(new ErrorHander("'Post does not exits",400));

  const isLiked = post.like.find((like)=>
  like.user.toString() === req.user._id.toString()
  );
 

  //then dislike
  if(isLiked){
         const likes = post.like.filter((like)=>  like.user.toString() !== req.user._id.toString());
         console.log(likes)
         await Post.findByIdAndUpdate(
          id,
          {
           like: likes
           
          },
          {
            new: true,
            runValidators: true,
            useFindAndModify: false,
          }
        );
        res.status(200).json({
          success:true,
          message:"Post dislike successfully"
        })
  }


   //push the user in likes
   else{
    const like = {
      user: req.user._id,
      name: req.user.name
    };
    post.like.push(like);
    post.save({ validateBeforeSave: false });
    res.status(200).json({
      success:true,
      message:"Post like successfully"
    })
   }
})

//get all comments of specific post
exports.getAllComments = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  const post = await Post.findById(id);

  if(!post) return next(new ErrorHander("'Post does not exits",400));

  res.status(200).json({
    success:true,
    comment:post.comment
  })
})


//comment on post
exports.commentPost = catchAsyncError(async(req,res,next) => {
  const {id} = req.params;
  const {comment} = req.body;
    
  const post = await Post.findById(id);

  if(!post) return next(new ErrorHander("'Post does not exits",400));

  if(!comment) return next(new ErrorHander("Enter the comment on Post",400));

  const cmmt ={
    user:req.user.id,
    name:req.user.name,
    message:comment

  }

  post.comment.push(cmmt);
  post.save({ validateBeforeSave: false });
  res.status(200).json({
    success:true,
    message:"Commented Post Successfully successfully"
  })

})


//remove the temp files on uploading the images
const removeTmp = (path) => {
    fs.unlink(path, (err) => {
      if (err) {
        return next(new ErrorHander(err, 400));
      }
    });
  };