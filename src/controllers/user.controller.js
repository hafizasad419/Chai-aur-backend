import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import fs from "fs";
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
    const { username, email, pass, fullName } = req.body;
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
            const avatarPath = req.files?.avatar[0].path;
            console.log("Avatar path:", avatarPath);
            const result = await uploadOnCloudinary(avatarPath);
            if (result) {
                avatarUrl = result.secure_url;
                console.log("Uploaded avatar URL:", avatarUrl);
            } else {
                return res.status(500).json({ error: "Failed to upload avatar." });
            }
        } catch (error) {
            console.error("Error in Cloudinary upload:", error);
            return res.status(500).json({ error: "Failed to upload avatar." });
        }
    }

    const user = await User.create({
        username,
        email,
        fullName,
        avatar: avatarUrl,
        pass,
    })

    const createdUser = await User.findById(user._id).select(
        "-pass -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

})
export { registerUser };
