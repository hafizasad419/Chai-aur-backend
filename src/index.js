import connectDB from "./db/connectDB.js";
import { app } from "./app.js";
import { configDotenv } from "dotenv"

configDotenv({ path: "./.env" });


app.listen(process.env.PORT || "3001", () => {
    console.log(`Server Is Running On ${process.env.PORT || "3001"}`);
})

app.on("error", (error) => {
    console.log(error);
    throw error;
})
















//follwing approach can also be used but it's is a little bit messy. 
/*
const app = express()

const connectDB = (async () => {

    try {
        await mongoose.connect(`${process.env.MONGO_DB_URI
            }/${DB_NAME}`)

        app.on("error", (error) => {
            console.log(`Error: ${error}`);
            throw error
        })

        app.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on port ${process.env.PORT || 7000}`);
        })
    }
    catch (error) {
        console.log(`Error: ${error}`);
        throw error
    }

})();

*/
