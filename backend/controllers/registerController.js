import {Register} from "../models/register.js";
import {z} from "zod"
import mongoose from "mongoose";
import {Chapters} from "../models/chapters.js";

const createRegister = z.object({
    student_id: z.string(),
    class_id : z.array(z.string()),
})

const creteStudentRegister = async(req,res) => {
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
                createdAt:  result.createdAt,
                updated_at: result.updatedAt,
            }
        })
    }catch(e){
        console.log(e.message);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e.message,
        })
    }
}

const updateRegSchema = z.object({
    class_id: z.array(z.string()),
});

const updateRegister = async (req, res) => {
    try {
        const studentId = req.query.student_id;

        if (!studentId) {
            return res.status(400).json({ message: "student_id is required" });
        }

        const registerSafeParse = updateRegSchema.safeParse(req.body);
        if (!registerSafeParse.success) {
            return res.status(400).json({
                message: "invalid inputs",
                errors: registerSafeParse.error.errors
            });
        }

        const result = await Register.findOneAndUpdate(
            { student_id: studentId },
            registerSafeParse.data,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: "Register not found or update failed"
            });
        }

        return res.status(200).json({
            message: "Successfully updated register",
            data: {
                student_id: result.student_id,
                class_id: result.class_id,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
            }
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong",
            error: e.message,
        });
    }
};


// get data using class id
const registerClassByFindClassId = async(req,res) => {
    try {
        const id = req.query.class_id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid class id" });
        }
        const result = await Register.find({class_id : id}).sort({ date: -1 });

        const resultArr = result.map((register) => ({
            register_id: register._id,
            class_id : register.class_id,
            student_id: register.student_id,
            createdAt:  register.createdAt,
            updated_at: register.updatedAt,
        }))

        res.status(200).json({
            "message": "register filter by class id",
            "data": {
                "register" : {
                    resultArr
                }
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

const registerClassByFindStudentId = async(req,res) => {
    try {
        const id = req.query.student_id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }
        const result = await Register.find({student_id : id}).sort({ date: -1 });

        const resultArr = result.map((register) => ({
            register_id: register._id,
            class_id : register.class_id,
            student_id: register.student_id,
            createdAt:  register.createdAt,
            updated_at: register.updatedAt,
        }))

        res.status(200).json({
            "message": "register filter by student id",
            "data": {
                "register" : {
                    resultArr
                }
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

const getAllRegisters = async (req, res) => {
    try {
        const results = await Register.find().sort({ createdAt: -1 });

        const resultArr = results.map((register) => ({
            register_id: register._id,
            student_id: register.student_id,
            class_id: register.class_id,
            createdAt: register.createdAt,
            updatedAt: register.updatedAt,
        }));

        return res.status(200).json({
            message: "Successfully retrieved all registers",
            data: resultArr,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal server error",
            error: e.message,
        });
    }
};


const deleteRegisterSchema = z.object({
    class_id: z.array(z.string()),
});


const deleteRegisterClassByRegisterId = async (req, res) => {
    try {
        const studentId = req.query.student_id;

        if (!studentId) {
            return res.status(400).json({ message: "student_id is required" });
        }

        const passSchema = deleteRegisterSchema.safeParse(req.body);
        if (!passSchema.success) {
            return res.status(400).json({
                message: "invalid inputs",
                errors: passSchema.error.errors,
            });
        }

        const { class_id } = passSchema.data;

        const result = await Register.findOneAndUpdate(
            { student_id: studentId },                  // search by student_id
            { $pull: { class_id: { $in: class_id } } }, // remove class_ids
            { new: true }                               // return updated doc
        );

        if (!result) {
            return res.status(404).json({
                message: "Register not found or delete failed"
            });
        }

        return res.status(200).json({
            message: "Successfully deleted selected classes from register",
            data: {
                student_id: result.student_id,
                class_id: result.class_id,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
            }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: "Internal server error",
            error: e.message,
        });
    }
};



export {creteStudentRegister,updateRegister,registerClassByFindClassId, registerClassByFindStudentId, getAllRegisters, deleteRegisterClassByRegisterId};
