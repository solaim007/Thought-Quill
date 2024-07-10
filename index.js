const express = require("express");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const Blog = require("./models/blog");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const { log } = require("console");

dotenv.config();
const PORT = process.env.PORT;
const app = express();

// mongoose
//   .connect("mongodb://localhost:27017/blogify")
//   .then(() => {
//     console.log("mongodb connected sucessfully");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

async function connectMongoose() {
    try {

        const response = await mongoose.connect("mongodb://localhost:27017/blogify");
        console.log(response.models);
    } catch(error) {
        console.error(error);
    }

}

connectMongoose();

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

//setting up Ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`Server is Running at port ${PORT}`);
});
