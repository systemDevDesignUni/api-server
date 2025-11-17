import mongoose from "mongoose";
import {z} from "zod";
import { exam } from "../models/exam";


const examSchema = z.object({
    exam_name:z.string(),
    exam_description:z.string(),
    exam_type: z.int(),
    additional: z.string.optional()
})


const createExam = async(req, res) => {
    try {
        const safeParse = examSchema.safeParse(req.body)

        if(!safeParse.success){
            return res.status(401).json(
                {
                    'message' : "schema validation fail",
                    'errors': safeParse.error.errors,
                }
            )
        }

        const { exam_name, exam_description, exam_type, addtional } = safeParse.data()

        const result = await mongoose.create(safeParse.data)

        if (!result){
            return res.status(500).json({
                'message': 'exam create fail'
            })
        }
        
        return res.status(201).json({
            'message': 'exam create successfully'
        });
    }catch (e) {
        console.error(e);
        return res.status(200).json({
            "message": "fail to create server"
        })
    }
}