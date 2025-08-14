import { Router } from "express";
import { asyncHandler } from "../utils/handler.js";
import { auth } from "../middlewares/auth";
import { studentRegister } from "../controllers/authController";

const router = Router();

router.post("/register", asyncHandler(studentRegister));


export default router;