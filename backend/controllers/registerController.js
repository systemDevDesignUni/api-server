import {Register} from "../models/register.js";
import {z} from "zod"
import mongoose from "mongoose";
import {Chapters} from "../models/chapters";

const createRegister = z.object({
    student_id: z.string(),
    class_id : z.array(z.string()),
})

const creteRegister = async(req,res) => {
    try{
        // const id = req.query.id;
        // if(!id){
        //     res.status(400).json({
        //         "message": "id is required"
        //     })
        // }
        const registerSafeParse = createRegister.safeParse(req.body);
        if(!registerSafeParse){
            res.status(400).json({
                "message": "invalid inputs"
            })
        }
        const result = await Register.create(registerSafeParse.data);
        if(!result){
            res.status(400).json({
                "message": "register creation failed"
            })
        }
        res.status(201).json({
            message: "Successfully registered",
            data: {
                student_id: result.student_id,
                class_id : result.class_id ,
            }
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message,
        })
    }
}

const updateRegSchema =  z.object({
    class_id:z.array(z.string()),
})

const updateRegister = async(req,res) => {

    try {
        const id = req.body.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const registerSafeParse = createRegister.safeParse(req.body);
        if(!registerSafeParse){
            res.status(400).json({
                "message": "invalid inputs"
            })
        }

        const result = await Register.findByIdAndUpdate(id,registerSafeParse.data,{new: true});
        if(!result){
            res.status(404).json({
                "message": "Register not found or update failed"
            })
        }
        res.status(200).json({
            message: "Successfully updated register",
            data: {
                student_id: result.student_id,
                class_id : result.class_id ,
            }
        })
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "invalid inputs",
            "error": e.message,
        })
    }
}

// get data using class id
const registerClassByClassId = async(req,res) => {
    try {
        const id = req.body.class_id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid class id" });
        }
        const result = await Chapters.find({class_id : id}).sort({ date: -1 });

        const resultArr = result.map((register) => ({
            register_id: register._id,
            class_id : register.class_id,
            student_id: register.student_id,
        }))

        res.status(200).json({
            "message": "register filter by class id",
            "data": {
                resultArr
            }
        })
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            "message": "internal server error",
            "error": e.message,
        })
    }
}