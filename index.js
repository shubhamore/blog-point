const express = require("express");
const port = process.env.PORT || 4000;
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
// const uploadMiddleware = multer({ dest: "uploads/" });
// const fs = require("@cyclic.sh/s3fs")(process.env.CYCLIC_BUCKET_NAME)
const Post = require("./models/postModel");
const path = require("path");

require("dotenv").config();
const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

  app.use(express.static(path.join(__dirname, "client/build")));
  
  app.use(express.json({ limit: '10mb' })); // Increase the limit to 1 MB for JSON
  app.use(express.urlencoded({ limit: '10mb', extended: true })); // Increase the limit to 1 MB for URL-encoded
app.use(cors({ credentials: true, origin: "" }));
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.disable("etag");
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const u = await User.findOne({ username });
  if (u) {
    res.status(400).json({ message: "user already exists" });
  } else {
    const hashedpass = await bcrypt.hash(password, 10);
    try {
      const newUser = await User.create({ username, password: hashedpass });
      res.json(newUser);
    } catch (error) {
      res.status(400).json(error);
    }
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const u = await User.findOne({ username });
  if (!u) {
    res.status(400).json({ message: "user does not exist" });
  } else {
    const match = await bcrypt.compare(password, u.password);
    if (!match) {
      res.status(400).json({ message: "incorrect password" });
    } else {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: "5d",
      });
      res.cookie("token", token, { httpOnly: true });
      res.json(username);
    }
  }
});

app.get("/profile", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "not logged in" });
  } else {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      res.json(payload);
    } catch (error) {
      res.status(400).json({ message: "invalid token" });
    }
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "logged out" });
});

app.post("/createPost", async (req, res) => {


  const token = req.cookies.token;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = payload;
    const { title, summary, content,image } = req.body;
    const newPost = new Post({
      title,
      summary,
      content,
      image,
      author: username,
      likedBy: []
    });
    await newPost.save();
    res.json(newPost);
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "invalid token" });
  }
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

app.put("/editpost", async (req, res) => {

  const token = req.cookies.token;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = payload;
    const { title, summary, content,image, id } = req.body;
    console.log("-------------------------------------------------------------------")
    console.log(image)
    const post = await Post.findById(id);
    if (post.author === username) {
      post.title = title;
      post.summary = summary;
      post.content = content;
      post.image = image;
      post.save();
      res.json(post);
    } else {
      res.status(400).json({ message: "invalid token" });
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: "invalid token" });
  }
});

app.get("/myPosts", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "not logged in" });
  } else {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const { username } = payload;
      const posts = await Post.find({ author: username });
      res.json(posts);
    } catch (error) {
      res.status(400).json({ message: "invalid token" });
    }
  }
});

app.delete("/deletepost/:id", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "not logged in" });
  } else {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const { username } = payload;
      const post = await Post.findById(req.params.id);
      if (post.author === username) {
        post.deleteOne();
        res.json({ message: "post deleted" });
      } else {
        res.status(400).json({ message: "error occured" });
      }
    } catch (error) {
      res.status(400).json({ message: "invalid token", err: error });
    }
  }
});
app.post("/unlike", async (req, res) => {
  const token = req.cookies.token;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = payload;
    const { id } = req.body;
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    const index = post.likedBy.indexOf(username);
    if (index === -1) {
      res.status(400).json({ message: "You have not liked this post" });
      return;
    }
    post.likedBy.splice(index, 1);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "invalid token" });
  }
});

app.post("/like", async (req, res) => {
  const { token } = req.cookies;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = payload;
    const { id } = req.body;
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    const index = post.likedBy.indexOf(username);
    if (index !== -1) {
      res.status(400).json({ message: "You have already liked this post" });
      return;
    }
    post.likedBy.push(username);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: "invalid token" });
  }
});

app.get("/likedposts",async(req,res)=>{
  const {token}=req.cookies
  try {
    const payload=jwt.verify(token,process.env.JWT_SECRET)
    const {username}=payload
    const posts=await Post.find({likedBy:username})
    res.json(posts)
  }
  catch(error){
    res.status(400).json({message:"invalid token"})
  }
})

app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "client/build","index.html"),
    // function (err) {
    //   res.status(500).send(err);
    // }
  );
});