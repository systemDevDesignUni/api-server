import mongoose from "mongoose";
import { z } from "zod";
import Exam from "../models/exam.js";
import { storeExamAnswers, checkMcqAnswers } from "../utils/examRand.js";
import { createSessionId, getSessionId } from "../utils/sessions.js";


const examSchema = z.object({
    class_id: z.string(),
    exam_name: z.string(),
    exam_description: z.string(),
    exam_type: z.number(),
    additional: z.string().optional()
});

const examDeleteSchema = z.object({
    exam_id: z.string()
});

const examMcqSchema = z.object({
    session_id: z.string(),
    exam_id: z.string(),
    answers: z.string() 
});


const createExam = async (req, res) => {
    try {
        const body = examSchema.safeParse(req.body);

        if (!body.success) {
            return res.status(401).json({
                message: "Schema validation failed",
                errors: body.error.errors
            });
        }

        const created = await Exam.create(body.data);

        if (!created) {
            return res.status(500).json({
                message: "Exam creation failed"
            });
        }

        return res.status(201).json({
            message: "Exam created successfully",
            exam_id: created._id
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
        const exam_id = req.params.exam_id;

        const exam = await Exam.findById(exam_id);

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        
        const mcqs = [...exam.mcq].sort(() => Math.random() - 0.5);

        
        const answerMap = {};
        mcqs.forEach((q, index) => {
            answerMap[index + 1] = q.correct_answer;
        });

        storeExamAnswers(exam_id, JSON.stringify(answerMap));

        
        const publicMcq = mcqs.map(q => ({
            question: q.question,
            answers: q.answers
        }));

        return res.status(200).json({
            exam_id,
            exam_name: exam.exam_name,
            exam_description: exam.exam_description,
            mcq: publicMcq
        });

    } catch (e) {
        console.error(e);
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
