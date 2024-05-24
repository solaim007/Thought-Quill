const { Router } = require("express");
const User = require("../models/user");

const router = Router();

// Render the signin page
router.get("/signin", (req, res) => {
    res.render("signin");
});

// Render the signup page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// Handle user signup
router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        // Create a new user
        await User.create({ fullName, email, password });
        return res.redirect("/");
    } catch (error) {
        console.error(error);
        // Render the signup page with an error message
        return res.render("signup", { error: "An error occurred during signup. Please try again." });
    }
});

// Handle user signin
router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Verify user credentials and generate token
        const token = await User.matchPasswordAndGenerateToken(email, password);

        // Set the token as a cookie and redirect to the homepage
        return res.cookie("token", token).redirect("/"


        );
    } catch (error) {
        console.error(error);
        // Render the signin page with an error message
        return res.render("signin", { error: "Incorrect email or password." });
    }
});
router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect('/');
})
router.get("/upload", async (req, res) => {
    return res.render("upload", {
        user: req.user,
    })
});












module.exports = router;
