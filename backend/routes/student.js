import {Router} from "express";
import {auth} from "../middlewares/auth";
import { asyncHandler } from "../utils/handler.js";
import {studentDetails} from "../controllers/studentController.js";
import {studentRegister} from "../controllers/authController";

const router = Router();
router.post("/studentDetails", auth(true),asyncHandler(studentDetails));

export default router;