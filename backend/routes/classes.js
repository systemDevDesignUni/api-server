import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {createClass,updateClass,allClasses,deleteClass,changeClassStatus} from "../controllers/classControlers.js";

const router = Router();

router.get("/allClasses", auth(true),  asyncHandler(allClasses));
router.post("/createClass", auth(true), asyncHandler(createClass));
router.put("/updateClass", auth(true), asyncHandler(updateClass));
router.delete("/deleteClass", auth(true), asyncHandler(deleteClass));
router.patch("/changeStatus", auth(true), asyncHandler(changeClassStatus));
// class find by id -> not imple

export default router;