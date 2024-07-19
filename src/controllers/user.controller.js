import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // console.log('Register User function called');

    /*
   Get user details from frontend
   validation - not empty
   check if user already exists: username, email
   check for images, check for avatar
   upload them to cloudinary, avatar
   create user object - create entry in DB
   remove password and refresh token field from response
   check for user creation
   if user created, return response
   otherwise return error

    */


    const { username, email, fullName } = req.body
    console.log(`User email is ${email}`);

    if (
        [username, email, fullName].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All Fields is required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) throw new apiError(400, "User already exists")

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) throw new apiError(400, "Avatar is required")

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) throw new apiError(400, "Avatar is required")

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new apiError(500, "Something went wrong while registering the user")

    return res.status(200).json(
        apiResponse(200, createdUser, "User registered Successfully")
    )

});

export { registerUser };
