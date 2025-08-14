import jwt from "jsonwebtoken";
import {email, z} from "zod";
import { Student } from "../models/student";

const registerSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    password: z.string(),
    date_of_birth: z.date(),
    mobile: z.string(),
    email: z.string.email()
})


const loginSchema = z.object({
    email: z.string(),
    password: z.string()
})

const studentToken = (Student) => {
    return jwt.sign(
        {
            email: Student.email,
            first_name: Student.first_name,
            last_name: Student.last_name,
            mobile: Student.mobile
        },process.env.JWT_SECRET,
        {
            subject: Student._id.toString(),
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
    );
}