import express from "express";
import {createPayment, getPaymentsByClass, getPaymentsByStudent, payThisMonthStudent} from "../controllers/paymentController.js";
import {auth} from "../middlewares/auth.js";

const router = express.Router();


router.post("/paymentCreate",auth(true) ,createPayment);
router.get("/paymentByStudent",auth(true) , getPaymentsByStudent);
router.get("/paymentByClass",auth(true) , getPaymentsByClass);
router.get("/paymentInThisMonth",auth(true) , payThisMonthStudent);

export default router;