import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

/*
Get user details from frontend
validation - not empty
check if user already exists: username, email
check for images, check for avatar
upload them to cloudinary, avatar
create user object - create entry in DB
remove pass and refresh token field from response
check for user creation
if user created, return response
otherwise return error

*/
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, pass } = req.body;
    console.log(username, email, pass);

    if (!username || !email || !pass) {
        return res.status(400).json({ error: "Required fields are missing." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.status(409).json({ error: "Username or email already exists." });
    }

    let avatarUrl = null;
    if (req.files && req.files.avatar) {
        try {
            const avatarPath = req.files.avatar[0].path;
            const result = await cloudinary.uploader.upload(avatarPath);
            avatarUrl = result.secure_url;
            fs.unlink(avatarPath, (err) => {
                if (err) console.error(`Failed to delete local file: ${err.message}`);
            }); // Remove the local file after uploading to Cloudinary
        } catch (error) {
            return res.status(500).json({ error: "Failed to upload avatar." });
        }
    }

    const newUser = new User({
        username,
        email,
        pass,
        avatar: avatarUrl,
    });

    try {
        const savedUser = await newUser.save();

        const responseUser = { ...savedUser._doc };
        delete responseUser.pass;
        delete responseUser.refreshToken;

        return res.status(201).json({ user: responseUser });
    } catch (error) {
        return res.status(500).json({ error: "Failed to create user." });
    }
});

export { registerUser };
