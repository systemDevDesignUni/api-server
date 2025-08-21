import {Chapters} from '../models/chapters.js';
import {z} from 'zod';
import {Class} from "../models/class.js";
import mongoose from "mongoose";


const chapterRegSchema = z.object(
    {
        class_id : z.string(),
        chapter_url : z.array(z.string()),
        chapter_name : z.string(),
        chapter_description : z.string().optional(),
        chapter_notes : z.array(z.string()),

    }
)

const createChapter = async (req, res) => {
    try {
        const chapterSchema = chapterRegSchema.safeParse(req.body);
        if (!chapterSchema) {
            res.status(400).json({
                "message": "Invalid inputs"
            })
        }
        // check class is already exists
        const class_ = await Class.findById(chapterSchema.data.class_id);
        if (!class_) {
            res.status(404).json({
                "message": "Class not found"
            })
        }

        const chapter = await Chapters.create(chapterSchema.data);
        if (!chapter) {
            res.status(400).json({
                "message": "chapter creation failed"
            })
        }

        res.status(200).json({
            "message": "Chapter created successfully",
            data: {
                chapter: {
                    chapter_id: chapter._id,
                    class_id: chapter.class_id,
                    chapter_name: chapter.chapter_name,
                    chapter_notes: chapter.chapter_notes,
                    chapter_url: chapter.chapter_url,
                    chapter_description: chapter.chapter_description,
                    chapter_status: chapter.chapter_status,
                    created: chapter.createdAt,
                    updated_at: chapter.updatedAt,
                }
            }
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message
        })
    }
}

const classChapters = async (req, res) => {
    try {
        const id = req.query.class_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }

        const check = await Class.findById(id);
        if (!check) {
            return res.status(404).json({
                message: "Class not found",
            });
        }

        const chapters = await Chapters.find({ class_id: check._id }).sort({ createdAt: -1 });

        if (!chapters || chapters.length === 0) {
            return res.status(404).json({
                message: "No chapters found for this class",
            });
        }

        const chapterArr = chapters.map((chapter) => ({
            chapter_id: chapter._id,
            class_id: chapter.class_id,
            chapter_name: chapter.chapter_name,
            chapter_notes: chapter.chapter_notes,
            chapter_url: chapter.chapter_url,
            chapter_description: chapter.chapter_description,
            chapter_status: chapter.chapter_status,
            created: chapter.createdAt,
            updated_at: chapter.updatedAt,
        }));

        return res.status(200).json({
            message: "Chapters filtered by class_id",
            data: chapterArr,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
};


const deleteChapter = async (req, res) => {
    try {
        const id = req.query.chapter_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }

        const result = await Chapters.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({
                "message": "Chapter not found"
            })
        }

        res.status(200).json({
            "message": "Chapter deleted successfully",
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
        })
    }
}

const updateSchema = z.object({
    class_id : z.string(),
    chapter_url : z.array(z.string()),
    chapter_name : z.string(),
    chapter_description : z.string(),
    chapter_notes: z.array(z.string()),
})


const updateChapter = async (req, res) => {
    try{
        const id = req.query.chapter_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }

        const passSchema = updateSchema.safeParse(req.body);

        const chapter = await Chapters.findByIdAndUpdate(id,passSchema.data, {new: true});
        if (!chapter) {
            res.status(404).json({
                "message": "Chapter not found"
            })
        }

        res.status(200).json({
            "message": "Chapter updated successfully",
            data: {
                "chapter" : {
                    chapter_id: chapter._id,
                    class_id: chapter.class_id,
                    chapter_name: chapter.chapter_name,
                    chapter_notes: chapter.chapter_notes,
                    chapter_url: chapter.chapter_url,
                    chapter_description: chapter.chapter_description,
                    chapter_status: chapter.chapter_status,
                    created: chapter.createdAt,
                    updated_at: chapter.updatedAt,
                }
            }
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message
        })
    }
}

export {createChapter, classChapters,deleteChapter,updateChapter}






