import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {studentDetails, allStudents,updateStudent, deleteStudent, changeStudentStatus} from "../controllers/studentController.js";


const router = Router();
router.get("/studentDetails", auth(true),asyncHandler(studentDetails));
router.get("/allStudents",auth(true), asyncHandler(allStudents));
router.put("/updateStudent",auth(true), asyncHandler(updateStudent));
router.delete("/deleteStudent",auth(true),asyncHandler(deleteStudent));
router.patch("/studentStatus",auth(true),asyncHandler(changeStudentStatus));

export default router;