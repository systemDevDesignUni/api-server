import { Router } from "express";
import { asyncHandler } from "../utils/handler.js";
import { auth } from "../middlewares/auth.js";
import { studentRegister,adminLogin,studentLogin } from "../controllers/authController.js";

const router = Router();

router.post("/register", asyncHandler(studentRegister));
router.post("/login", asyncHandler(studentLogin));
//router.get("/student",auth(true) ,asyncHandler(student));
router.get("/check", asyncHandler(
    (req,res) => {res.status(200).json({"hi": "hello"})}
));

export default router;