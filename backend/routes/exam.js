import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {createExam, deleteExam} from "../controllers/examController.js"

const router = Router()

router.post("/createExam", auth(true), asyncHandler(createExam));
router.delete("/deleteExam", auth(true), asyncHandler(deleteExam))

export default router