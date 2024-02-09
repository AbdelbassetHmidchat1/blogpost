const express = require("express");
const path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("connect-flash");

mongoose.connect("mongodb://localhost:27017/BlogDB");
const User = require("./models/User");
const blogPost = require("./models/BlogPost");


const app = express();

const validateMiddleware = (req, res, next) => {
  if (req.files == null || req.body == null) {
    res.redirect("/contact");
  }
  next();
};
const validateNotLogin = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.session.id });
    if (!user) {
      console.log("hiiiiiii");
      return res.redirect("/");
    }
  } catch (error) {}
  next();
};
const validateLogin = async (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  next();
};

app.use(
  session({
    secret: "hiiii",
    resave: true,
    saveUninitialized: true,
  })
);
global.loggedIn = null;

app.use("*", (req, res, next) => {
  loggedIn = req.session.userId;
  next();
});

app.use(express.static("public"));
app.use(flash());
app.use(fileUpload());
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(4000, () => {
  console.log("listening");
});

app.get("/about", (req, res) => {
  res.render(path.resolve("./views/about"));
});
app.get("/contact", (req, res) => {
  res.render(path.resolve("./views/contact"));
});

app.get("/create", (req, res) => {
  if (req.session.userId) {
    return res.render("create");
  }
  res.redirect("/auth/login");
});

app.get("/", async (req, res) => {
  try {
    const blogposts = await blogPost.find({}).populate('userid');

    res.render("index", {
      blogposts,
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    const blogpost = await blogPost.findById(req.params.id).populate("userid");
    res.render("post", {
      blogpost,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/posts/store", validateNotLogin, (req, res) => {
  let image = req.files.name;
  image.mv(
    path.resolve(__dirname, "/assets/img", image.name),
    async (error) => {
      await blogPost.create({
        ...req.body,
        userid: req.session.userId,
        image: "/assets/img/" + image.name,
      });
    }
  );
  res.redirect("/");
});

app.get("/auth/register", validateLogin, (req, res) => {
  res.render("register", {
    errors: req.flash("validationErrors"),
  });
});

app.post("/users/register", validateLogin, async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.redirect("/");
  } catch (error) {
    const errorMessages = Object.keys(error.errors).map(
      (key) => error.errors[key].message
    );
    req.flash("validationErrors", errorMessages);
    res.redirect("/auth/register");
  }
});
app.post("/users/login", validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if (user) {
      bcrypt.compare(password, user.password, (error, same) => {
        if (error) {
          console.error("Error comparing passwords:", error);
          req.flash("loginErrors", "An error occurred during login");
          res.redirect("/auth/login");
        } else if (same) {
          req.session.userId = user._id;
          res.redirect("/");
        } else {
          req.flash("loginErrors", "Incorrect password");
          res.redirect("/auth/login");
        }
      });
    } else {
      req.flash("loginErrors", "User not found");
      res.redirect("/auth/login");
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (error) => error.message
      );
      req.flash("loginErrors", errorMessages);
    } else {
      console.error("Login error:", error);
      req.flash("loginErrors", "An error occurred during login");
    }
    res.redirect("/auth/login");
  }
});

app.get("/auth/login", validateLogin, (req, res) => {
  res.render("login", {
    errors: req.flash("loginErrors"),
  });
});

app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.use((req, res) => {
  res.render("notfound");
});
