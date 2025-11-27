import mongoose from "mongoose";
import { int, string } from "zod";

const mcqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answers: {
        type: [String], 
        required: true
    },
    correct_answer: {
        type: [Number], // (supports MSQ)
        required: true
    }
});

const examSchema = new mongoose.Schema(
    {
        exam_name: {
            type: String,
            required: true
        },
        exam_description: {
            type: String,
            required: true
        },
        exam_type: {
            type: mongoose.Schema.Types.Mixed, 
            required: true
        },
        class_id: {
            type: String,
            required: true
        },
        additional: {
            type: String
        },
        duration: {
            type: Number,   // minutes
            required: true
        },
        mcq: {
            type: [mcqSchema],  // array of MCQ objects
            default: []
        }
    },
    {
        timestamps: true
    }
);

examSchema.pre("save", function (next) {
    if (this.isModified("exam_type")) {
        const typeValue = String(this.exam_type).toLowerCase();

        if (typeValue === "mcq" || typeValue === "1") {
            this.exam_type = 1;
        } else if (typeValue === "essay" || typeValue === "2") {
            this.exam_type = 2;
        }
    }

    next();
});

export default mongoose.model("Exam", examSchema);

