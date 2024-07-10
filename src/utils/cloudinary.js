import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config(
    {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET
    }
)


const uploadOnCloudinary = async (localFilePath) => {

    try {
        if (!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`File has been uploaded successfully.`);
        console.log(response.url);

        return response;
    } catch (error) {
        fs.unlink(localFilePath) // remove the locally saved temporary file because uploading failed
        console.log("Error while uploading file on cloudinary");
    }

}


export {
    uploadOnCloudinary
}