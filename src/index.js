import { app } from "./app.js";
import { configDotenv } from "dotenv"
import connectDB from "./db/connectDB.js";
configDotenv({ path: "./.env" });

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3001, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 3001} `);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
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
