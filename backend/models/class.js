import mongoose from "mongoose";

const classSchema =new mongoose.Schema(
    {
        class_name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        class_url: {
            type: String,
            required: true
        },
        categories: {
            type: Array
        },
        class_ststus: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps:true
    }
)

export const Class = mongoose.Model("Class",classSchema);