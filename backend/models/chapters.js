import mongoose from "mongoose";
import String from "zod/src/v3/benchmarks/string";



const chapterSchema = new mongoose.Schema(
    {
        class_id: {
            type: String,
            required: true
        },
        chapter_url: {
            type: String,
            required: true
        },
        chapter_description: {
            type: String,
        },
        chapter_notes: {
            type: Array
        },
    },
    { timestamps: true }
)

export default mongoose.model("Chapters", chapterSchema);