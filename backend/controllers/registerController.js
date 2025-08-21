import {Register} from "../models/register.js";
import {z} from "zod"

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