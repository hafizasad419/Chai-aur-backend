import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

console.log('MONGO_DB_URI:', process.env.MONGO_DB_URI);

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log(`Error is here:${error}`);
        process.exit(1);
    }
}

export default connectDB;
