import jwt from "jsonwebtoken";
import {email, z} from "zod";
import { Student } from "../models/student";
import { AppError } from "../utils/Error";

const registerSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    password: z.string(),
    date_of_birth: z.date(),
    mobile: z.string(),
    email: z.string.email(),
});


const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
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

const studentRegister = async(req,res) => {
    const tmp = registerSchema.safeParse(req.body);
    if(!tmp.success){
        throw new AppError(tmp.error.message,400);
    }

    const studentExist = await Student.findOne({email: tmp.data.email});
    if(studentExist) {
        throw new AppError("email already register",409);
    }

    const student = await Student.create(tmp.data);
    const token = studentToken(student);

    res.status(201).json({
        message: "student register success",
        token,
        student: {
            id: student._id,
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            mobile: student.lastname,
        }
    })
}

export {studentRegister}