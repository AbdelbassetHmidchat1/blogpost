const mongoose = require("mongoose");
const blogPost = require("./models/BlogPost");

mongoose.connect(
  "mongodb://localhost:27017/BlogDB"
);

async function createBlogPost() {
  try {
    
    // const newBlogPost = await blogPost.where("title").equals("The Mythbuster’s Guide to Saving Money on Energy Bills").limit(1)
    // newBlogPost[0].body="test"
    // await newBlogPost[0].save()
    // console.log("Blog Post found", newBlogPost);

    const newBlogPost = await blogPost.create({title:"hi",body:"hi",username:"Abdelbasset"})
    console.log(newBlogPost);



  } catch (error) {
    console.error("Error creating blog post:", error);
  } 
}
createBlogPost()


