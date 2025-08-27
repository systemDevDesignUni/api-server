import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {registerClassByFindStudentId, deleteRegisterClassByRegisterId, getAllRegisters, updateRegister, creteStudentRegister, registerClassByFindClassId} from "../controllers/registerController.js";


const router = Router();

router.get("/registerStudentFindId", auth(true),asyncHandler(registerClassByFindStudentId));
router.post("/createRegister", auth(true),asyncHandler(creteStudentRegister));
router.get("/allRegister",auth(true), asyncHandler(getAllRegisters));
router.put("/updateRegister",auth(true), asyncHandler(updateRegister));
router.delete("/deleteRegister",auth(true),asyncHandler(deleteRegisterClassByRegisterId));
router.get("/registerClassFindId",auth(true),asyncHandler(registerClassByFindClassId));

export default router;



