import mongoose from "mongoose";

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
            type: mongoose.Schema.Types.Mixed,  // accepts string or number
            required: true
        },
        additional: {
            type: String
        },
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
