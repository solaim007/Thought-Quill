const { Schema, model, default: mongoose } = require("mongoose");
const { createHmac, randomBytes } = require('crypto');
const {createTokenForUser,validateToken} = require("../services/authentication")

// User schema definition
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // Make sure emails are unique
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png"
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
    }
}, { timestamps: true });

// Pre-save hook to hash the password
userSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    
    // Generate a new salt and hash the password
    user.salt = randomBytes(16).toString('hex');
    user.password = createHmac('sha256', user.salt)
        .update(user.password)
        .digest('hex');
    next();
});

// Static method to match passwords
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");
    
    const userProvidedHash = createHmac('sha256', user.salt)
        .update(password)
        .digest('hex');
    
    if (user.password !== userProvidedHash) throw new Error("Incorrect password");
    const token = createTokenForUser(user);
    return token;
};

// Model creation
const User = model('user', userSchema);

module.exports=User
