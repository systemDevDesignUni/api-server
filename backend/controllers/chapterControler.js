import {Chapters} from '../models/chapters.js';
import {z} from 'zod';
import {Class} from "../models/class.js";


const chapterRegSchema = {
    class_id : z.string(),
    chapter_url : z.array(z.string()),
    chapter_name : z.string(),
    chapter_description : z.string().optional(),
    chapter_notes : z.array(z.string()),

}

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
            "error": e
        })
    }
}

const classChapters = async (req, res) => {
    try{
        const id = req.query.class_id;
        if (!id) {
            res.status(400).json({
                "message": "class_id is required"
            })
        }

        const check = await Class.findById(id);
        if (!check) {
            res.status(404).json({
                "message": "Class not found"
            })
        }

        const chapters = await Chapters.find({class_id: check.class_id})

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

        res.status(200).json({
            "message": "Chapters filter class_id",
            data: {
                chapterArr
            }
        })

    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e
        })
    }
}

const deleteChapter = async (req, res) => {
    try {
        const id = req.query.chapter_id;
        if (!id) {
            res.status(400).json({
                "message": "chapter ID is required"
            })
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

export {createChapter, classChapters}






