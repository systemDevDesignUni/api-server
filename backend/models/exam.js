import mongoose from "mongoose";

const examSchema = mongoose.Schema(

    {
        exam_name: {
            type: String,
            required: true
        },
        exam_discrption: {
            type: String,
            required: true
        },
        addtional: {
            type: String
        },
    },
    {
        timestamps: true
    }

)