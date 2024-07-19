import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // console.log('Register User function called');
    res.status(200).json({
        message: "Hello World!"
    });
});

export { registerUser };
