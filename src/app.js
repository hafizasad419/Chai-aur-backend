import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN, credentials: true,
}))

app.use(express.json({
    limit: "1024kb"
}));

app.use(urlencoded({
    extended: true, limit: "24kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


//import routes

import userRouter from "./routes/user.routes.js"



//routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000//api/v1/users/[routes in user.routes.js]

export {
    app,
}
