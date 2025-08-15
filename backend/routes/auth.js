import { Router } from "express";
import { asyncHandler } from "../utils/handler.js";
import { auth } from "../middlewares/auth";
import { studentRegister,adminLogin,student,studentLogin } from "../controllers/authController";

const router = Router();

router.post("/register", asyncHandler(studentRegister));
router.post("/login", asyncHandler(studentLogin));


export default router;