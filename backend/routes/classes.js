import {Router} from "express";
import {auth} from "../middlewares/auth.js";
import { asyncHandler } from "../utils/handler.js";
import {createClass} from "../controllers/classControlers.js";

const router = Router();