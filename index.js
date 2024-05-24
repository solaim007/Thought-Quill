const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path")
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(express.json());
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const Blog = require("./models/blog");
dotenv.config();
const mongoose = require("mongoose");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
mongoose.connect("mongodb://localhost:27017/blogify").then(() => {
    console.log("mongodb connected sucessfully")
}).catch((err) => {
    console.log(err)
})
const PORT = process.env.PORT;
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));

//setting up Ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));



app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render('home', {
        user: req.user,
        blogs:allBlogs,
    });
})
app.use("/user", userRoute);
app.use("/blog",blogRoute);

app.listen(PORT, () => {
    console.log(`Server is Running at port ${PORT}`);
})