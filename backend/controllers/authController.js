import jwt from "jsonwebtoken";
import {email, z} from "zod";
import { Student } from "../models/student";
import { AppError } from "../utils/Error";
import { Admin} from "../models/admin";
import {compare} from "bcrypt";

const registerSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    password: z.string(),
    date_of_birth: z.date(),
    mobile: z.string(),
    email: z.string().email(),
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
            mobile: Student.mobile,
            student_status: Student.student_status,
            role: "student"
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
            mobile: student.mobile,
            student_status: student.student_status,
            role:"student",
        }
    })
}

const studentLogin = async(req,res) => {
    const tmp = loginSchema.safeParse(req.body);

    if(!tmp.success){
        throw new AppError(tmp.error.message,400);
    }

    const student = await Student.findOne({email: tmp.data.email}).select("+password");
    if(student) {
        const k = Student.comparePassword(tmp.data.password);
        if(k){
            // create token
            const token = studentToken(student);
            res.status(201).json({
                message: "student login success",
                token,
                student: {
                    id: student._id,
                    email: tmp.data.email,
                    first_name: tmp.data.email,
                    last_name: tmp.data.email,
                    mobile: tmp.data.email,
                    student_status: tmp.data.email,
                    role: "student",
                }
            })
        }else{
            throw new AppError(tmp.error.message,400);
        }
    }else {
        throw new AppError(tmp.error.message,400);
    }
}

export {studentRegister}