const { Router } = require("express");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const multer = require("multer");
const path = require("path");
const User = require("../models/user");
const router = Router();


const storage =multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,path.resolve(`./public/upload`))
    },
    filename: function (req,file,cb) {
        const fileName = `${Date.now()}-${file.originalname}`
        cb(null,fileName)
    },
})
const upload = multer({storage:storage})

router.get("/add-new",(req,res)=>{
    return res.render("addBlog",{
        user:req.user,
    })
})
router.get("/myBlog", async (req, res) => {
    try {
        const blogs = await Blog.find({ createdBy: req.user._id }).populate("createdBy");
        res.render("myBlog", {
            user:req.user,
            blogs,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
router.post("/delete/:id", async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    const blogs = await Blog.find({ createdBy: req.user._id }).populate("createdBy");
    return res.render("myBlog", {
        user: req.user,
        blogs,
    });
})
router.get("/:id", async(req,res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({blogId:req.params.id}).populate("createdBy");

    return res.render("blog",{
        user:req.user,
        blog,
        comments,
    })
})
router.post("/comment/:blogId",async(req,res)=>{
    const comment = await Comment.create({
        content:req.body.content,
        blogId:req.params.blogId,
        createdBy:req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
})
router.post("/", upload.single("coverImage"),async(req,res)=>{
    const {title,body} = req.body;
   const blog = await Blog.create({
        title,
        body,
        createdBy:req.user._id,
        coverImageURL:`/upload/${req.file.filename}`,

    })
        return res.redirect(`/blog/${blog._id}`);
    })



   router.post("/user", upload.single("profileImage"), async (req, res) => {
  

  try {
    await User.findByIdAndUpdate(req.user._id, {
      profileImageURL: `/upload/${req.file.filename}`,
    });
  } catch (err) {
    console.error(err); // log any errors
  }
  return res.redirect("/");
});




module.exports = router;