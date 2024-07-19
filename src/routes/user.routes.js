import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post((req, res, next) => {
    // console.log('Received a POST request to /register');
    next();
}, registerUser);

export default router;
