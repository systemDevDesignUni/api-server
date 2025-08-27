import mongoose from "mongoose";


const registerSchema = new mongoose.Schema(
    {
        student_id : {
            type: String,
            required: true,
        },
        class_id : {
            type: [String],
            required: true,
        }
    },{
        timestamps : true
}
)

export const Register = new mongoose.model("Register", registerSchema);