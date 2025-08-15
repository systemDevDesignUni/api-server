import mongoose from "mongoose";
import { date } from "zod";


const paymentSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            required: true
        },
        class_id: {
            type: String,
            required: true
        },
        reference: {
            type: String
        },
        payment_date: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

export const Payment = mongoose.model("Payment", paymentSchema);