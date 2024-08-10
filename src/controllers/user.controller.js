import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating refresh and access token")
    }
}


/*
- Register User
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

/*
- Login User

1. Get username and pass from req body.
2. Check if user exsists - compare email
3. if user exsists, compare his pass with pass stored in database.
5. if comparison become false, return error.
4. if comparison become successfull, return access and refresh token.
5. Send cookies



*/
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, pass } = req.body
    // console.log(req.body);
    if (!username && !email) {
        throw new apiError(400, "Please enter email or username.")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiError(404, "Please Sign Up First To Continue.")
    }

    // console.log('Plain text password:', pass);
    // console.log('Hashed password:', user.pass);

    const isPassValid = await user.isPassCorrect(pass)

    if (!isPassValid) {
        throw new apiError(401, "pass is invalid.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
        select("-pass -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully"
            )
        )
})



const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, //it removes a specific field from document.
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, {}, "User Logged Out Successfully.")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new apiError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET)

    try {

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new apiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {

            throw new apiError(401, "Refresh Token is expired.")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, newRefeshToken } = await generateAccessAndRefreshTokens(user?.id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefeshToken, options)
            .json(
                new apiResponse(
                    200,
                    { accessToken, refreshToken: newRefeshToken },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPass, newPass } = req.body
    // console.log(oldPass, newPass);


    const user = await User.findById(req.user?._id)

    const isPassCorrect = await user.isPassCorrect(oldPass)

    if (!isPassCorrect) {
        throw new apiError(401, "Invalid old password")
    }

    user.pass = newPass
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new apiResponse(200, {}, "Password Changed Successfully."))


})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }
    ).select("-pass")

    return res
        .status(200)
        .json(new apiResponse(200, user, "Account details updated successfully"))
})

// TODO: Delete old avatar from cloudinary after new avatar has been uploaded
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar File is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new apiError(400, "Error while uploading avatar on cloudinary.")
    }



    const user = await User.findOneAndUpdate(
        req.user?._id,

        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true,
        }
    ).select("-pass")
    console.log(req.user?._id);

    return res
        .status(200)
        .json(new apiResponse(200, user, "Avatar Successfully updated."))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new apiError(400, "Avatar File is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new apiError(400, "Error while uploading cover image on cloudinary.")
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: coverImage.url
            }
        },
        {
            new: true,
        }
    ).select("-pass")

    return res
        .status(200)
        .json(new apiResponse(200, user, "cover image Successfully updated."))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    console.log(username);


    if (!username) {
        throw new apiError(401, "username is missing.")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscriberedToCount: {
                    $size: "$subscribedTo"
                },

                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscriberedToCount: 1,
                isSubscribed: 1,

            }
        },
    ])
    console.log(channel);

    if (!channel?.length) {
        throw new apiError(401, "oops, channel not found.")
    }

    return res
        .status(200)
        .json(new apiResponse(200, channel[0], "User channel fetched successfully."))
}
)

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        },

    ]



    )

    return res
        .status(200)
        .json(new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully."))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar, updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,

};
