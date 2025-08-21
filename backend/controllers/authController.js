import jwt from "jsonwebtoken";
import {email, z} from "zod";
import { Student } from "../models/student.js";
import { AppError } from "../utils/Error.js";
import { Admin} from "../models/admin.js";
import {compare} from "bcrypt";

const registerSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    password: z.string(),
    date_of_birth: z.coerce.date(), // accepts string & converts to Date
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
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        }
    );
}

const adminToken = (Admin) => {
    return jwt.sign(
        {
            email: Admin.email,
            first_name: Admin.first_name,
            role: "admin",
        },process.env.JWT_SECRET,
        {
            subject: Admin._id.toString(),
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        }
    )
}

const studentRegister = async(req,res) => {
    try {
        console.log(req.body);
        const tmp = registerSchema.safeParse(req.body);
        if(!tmp.success){
            res.status(400).json({
                "message": tmp.error.message,
            })
        }

        const studentExist = await Student.findOne({email: tmp.data.email});
        if(studentExist) {
            res.status(409).json({
                "message": "Student already exist",
            });
        }

        const student = await Student.create(tmp.data);
        const token = studentToken(student);

        res.status(201).json({
            message: "student register success",
            token,
            data: {
                student: {
                    id: student._id,
                    email: student.email,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    mobile: student.mobile,
                    student_status: student.student_status,
                    role:"student",
                }
            }

        })
    }catch (e) {
        console.log(e);
        res.status(500).json({
            "message": "Internal server error",
        })
    }
}

const studentLogin = async(req,res) => {
    try{
        const tmp = loginSchema.safeParse(req.body);

        if(!tmp.success){
            res.status(400).json({
                "message":  tmp.error.message,
            })
        }

        const student = await Student.findOne({email: tmp.data.email}).select("+password");
        if(student) {
            const k = student.comparePassword(tmp.data.password);
            if(k){
                // create token
                const token = studentToken(student);
                res.status(200).json({
                    message: "student login success",
                    token,
                    data: {
                        student: {
                            id: student._id,
                            email: tmp.data.email,
                            first_name: tmp.data.email,
                            last_name: tmp.data.email,
                            mobile: tmp.data.email,
                            student_status: tmp.data.email,
                            role: "student",
                        }
                    }

                })
            }else{
                res.status(400).json({
                    "message":  "Student Login Failed",
                })
            }
        }else {
            res.status(404).json({
                "message":  "Student Not Found",
            })
        }
    }catch (e) {
        console.log(e);
        res.status(500).json({
            "message":  "Server error",
        })
    }
}

const adminLogin = async(req,res) => {
    try {
        const tmp = loginSchema.safeParse(req.body);
        if(!tmp.success){
            res.status(400).json({
                "message":  tmp.error.message,
            })
        }
        const admin = await Admin.findOne({email: tmp.data.email}).select("+password");
        if(!admin) {
            return res.status(400).json({
                "message": "Admin not found",
            })
        }
        const token = adminToken(admin);
        res.status(200).json({
            message: "admin login success",
            token,
            data: {
                admin: {
                    id: admin._id,
                    email: admin.email,
                    first_name: admin.name,
                }
            }
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal server error",
        })
    }

}



export {studentRegister, studentLogin, adminLogin}