import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {createExam, deleteExam, getExam, checkExamMcq} from "../controllers/examController.js"

const router = Router()
// add msq or delete exaa in db
router.post("/createExam", auth(true), asyncHandler(createExam));
router.delete("/deleteExam", auth(true), asyncHandler(deleteExam));


router.get("/getMcqExam", auth(true), asyncHandler(getExam));
router.post("/checkExam", auth(true), asyncHandler(checkExamMcq));

export default router