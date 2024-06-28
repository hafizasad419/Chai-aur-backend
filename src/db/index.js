import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import { configDotenv } from "dotenv"
configDotenv({ path: "./.env" });


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);

        // console.log(connectionInstance);
    }
    catch (error) {
        console.log(`Error is here: ${error}`);
        process.exit(1);
    }
}

export default connectDB;
