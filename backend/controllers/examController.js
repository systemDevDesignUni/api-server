import mongoose from "mongoose";
import { z } from "zod";
import Exam from "../models/exam.js";
import { storeExamAnswers, checkMcqAnswers } from "../utils/examRand.js";
import { createSessionId, getSessionId } from "../utils/sessions.js";


// const examSchema = z.object({
//     class_id: z.string(),
//     exam_name: z.string(),
//     exam_description: z.string(),
//     exam_type: z.number(),
//     additional: z.string().optional()
// });

const examDeleteSchema = z.object({
    exam_id: z.string()
});

const examMcqSchema = z.object({
    session_id: z.string(),
    exam_id: z.string(),
    answers: z.string() 
});

const examSchema = z.object({
    class_id: z.string(),
    exam_name: z.string(),
    exam_description: z.string(),
    exam_type: z.number(),
    duration: z.number(),          
    additional: z.string().optional(),

    mcq: z.array(
        z.object({
            question: z.string(),
            answers: z.array(z.string()),
            correct_answer: z.array(z.number())
        })
    )
});



const createExam = async (req, res) => {
    try {
        const parsed = examSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Schema validation failed",
                errors: parsed.error.errors
            });
        }

        const examData = parsed.data;

        // Save exam
        const createdExam = await Exam.create(examData);

        if (!createdExam) {
            return res.status(500).json({
                message: "Exam creation failed"
            });
        }

        return res.status(201).json({
            message: "Exam created successfully",
            exam_id: createdExam._id
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Server error"
        });
    }
};



const deleteExam = async (req, res) => {
    try {
        const parsed = examDeleteSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(401).json({
                message: "Schema validation failed",
                errors: parsed.error.errors
            });
        }

        const { exam_id } = parsed.data;

        const result = await Exam.findByIdAndDelete(exam_id);

        if (!result) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        return res.status(200).json({
            message: "Exam deleted successfully"
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Server error"
        });
    }
};


const getExam = async (req, res) => {
    try {
        const exam_id = req.query.exam_id;
        const student_id = req.user._id; 
        if (!exam_id) {
            return res.status(400).json({
                message: "exam_id is required"
            });
        }

        const exam = await Exam.findById(exam_id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        
        const shuffled = [...exam.mcq].sort(() => Math.random() - 0.5);

        
        const correctAnswersMap = {};
        shuffled.forEach((q, i) => {
            correctAnswersMap[i + 1] = q.correct_answer;
        });

        storeExamAnswers(exam_id, JSON.stringify(correctAnswersMap));

        const session_id = createSessionId(student_id, exam_id, exam.duration);

        
        const publicMcq = shuffled.map(q => ({
            question: q.question,
            answers: q.answers
        }));

        return res.status(200).json({
            message: "Exam loaded successfully",
            session_id: session_id,          
            exam_id: exam_id,
            exam_name: exam.exam_name,
            exam_description: exam.exam_description,
            duration: exam.duration,
            mcq: publicMcq                    
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Server error"
        });
    }
};



const checkExamMcq = (req, res) => {
    try {
        const parsed = examMcqSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(401).json({
                message: "Schema validation failed",
                errors: parsed.error.errors
            });
        }

        const { session_id, exam_id, answers } = parsed.data;

        // check session 
        if (!getSessionId(session_id)) {
            return res.status(403).json({
                message: "Session expired or invalid"
            });
        }

       
        const correctCount = checkMcqAnswers(exam_id, answers);

        return res.status(200).json({
            message: "MCQ checked successfully",
            correct: correctCount
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export { createExam, deleteExam, getExam, checkExamMcq };
