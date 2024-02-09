const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema({
  title: String,
  body: String,
  userid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true,
  },
  created:{
    type:Date,
    default: ()=>(Date.now())
  },
  image:String,
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
