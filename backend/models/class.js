import mongoose from "mongoose";
import {float32, number} from "zod";

const classSchema =new mongoose.Schema(
    {
        class_name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        // class_url: {
        //     type: String,
        //     required: true
        // },
        categories: {
            type: Array
        },
        class_status: {
            type: Boolean,
            default: true
        },
        price: {
            type: number()
        }
    },
    {
        timestamps:true
    }
)

export const Class = mongoose.Model("Class",classSchema);