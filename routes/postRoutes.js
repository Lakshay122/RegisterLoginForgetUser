const express = require("express");
const { getAllPost, uploadPost, getSinglePost, deletePost, userPost, myPost, updatePost, likePost, commentPost, getAllComments, getAllLikes,  } = require("../Controller/postController");
const { isAuthenticated } = require("../middleware/auth");

const router  = express.Router();

router.route("/getallpost").get(isAuthenticated,getAllPost);
router.route("/post/uploadpost").post(isAuthenticated,uploadPost);
router.route("/post/:id").get(isAuthenticated,getSinglePost).delete(isAuthenticated,deletePost).patch(isAuthenticated,updatePost);
router.route("/like-post/:id").get(isAuthenticated,likePost)
router.route("/user-post/:id").get(isAuthenticated,userPost);
router.route("/my-post").get(isAuthenticated,myPost);
router.route("/comment-post/:id").post(isAuthenticated,commentPost);
router.route("/allcomment/:id").get(isAuthenticated,getAllComments);
router.route("/alllikes/:id").get(isAuthenticated,getAllLikes)


module.exports = router