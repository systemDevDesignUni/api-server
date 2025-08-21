import {Class} from "../models/class.js";
import {float32, z} from "zod";
import mongoose from "mongoose";



const createClassSchema = z.object({
    class_name: z.string().min(1, "class_name is required"),
    description: z.string().min(1, "description is required"),
    categories: z.array(z.string()).optional(),
    price: z.coerce.number().positive("price must be a positive number"),
})

const createClass = async (req, res) => {
    try{
        const newClass = createClassSchema.safeParse(req.body);
        console.log(newClass);
        const class_ = await Class.create(newClass.data);

        res.status(201).json({
            message: "student register success",
            data: {
                class: {
                    id: class_._id,
                    class_name: class_.class_name,
                    description: class_.description,
                    categories: class_.categories,
                    price: class_.price,
                    class_status: class_.class_status,
                    created: class_.createdAt,
                    updated: class_.updatedAt,
                }
            }

        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            "message": "Internal Server Error",
            "error": e
        })
    }
}

const classUpdateSchema = z.object({
    class_name: z.string().min(1, "class_name is required"),
    description: z.string().min(1, "description is required"),
    categories: z.array(z.string()).optional(),
    price: z.coerce.number().positive("price must be a positive number"),
})

const updateClass = async (req, res) => {
    try {
        const passSchema = classUpdateSchema.safeParse(req.body);
        if (!passSchema) {
            res.status(400).json({
                "message": "Invalid inputs"
            })
        }
        const id = req.query.class_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }

        const updateClass = await Class.findByIdAndUpdate(id, passSchema.data,{new: true});
        if (!updateClass) {
            res.status(404).json({
                "message": "class not found"
            })
        }

        res.status(200).json({
            "message": "Class updated successfully",
            data: {
                class: {
                    id: updateClass._id,
                    class_name: updateClass.class_name,
                    description: updateClass.description,
                    categories: updateClass.categories,
                    price: updateClass.price,
                    class_status: updateClass.class_status,
                    created: updateClass.createdAt,
                    updated: updateClass.updatedAt,
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

const allClasses = async (req, res) => {
    try {
        const classes = await Class.find();

        const classArray = classes.map(class_ => ({
            id: class_._id,
            class_name: class_.class_name,
            description: class_.description,
            categories: class_.categories,
            price: class_.price,
            class_status: class_.class_status,
            created: class_.createdAt,
            updated: class_.updatedAt,
        }))

        if (classArray.length === 0) {
            res.status(200).json({
                "message": "Classes is empty"
            })
        }

        res.status(200).json({
            "message": "Class list ",
            "data": {
                classArray
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

const changeClassStatus = async (req, res) => {
    try {
        const id = req.query.class_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }
        const class_ = await Class.findByIdAndUpdate(
            id,
            [ { $set: { class_status: { $not: "$class_status" } } } ],
            { new: true }
        );
        res.status(200).json({
            message: "class change status success",
            data: {
                class: {
                    id: class_._id,
                    class_name: class_.class_name,
                    description: class_.description,
                    categories: class_.categories,
                    price: class_.price,
                    class_status: class_.class_status,
                    created: class_.createdAt,
                    updated: class_.updatedAt,
                }
            }

        })

    }catch(e){
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message
        })
    }
}

const deleteClass = async (req, res) => {
    try {
        const id = req.query.class_id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }
        const result = await Class.findByIdAndDelete(id);
        if (!result) {
            res.status(404).json({
                "message": "Class not found"
            })
        }

        res.status(200).json({
            "message": "Class deleted successfully"
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message
        })
    }
}

export {createClass,updateClass,allClasses,changeClassStatus,deleteClass}