import {Class} from "../../models/class.js";
import {float32, z} from "zod";


const createClassSchema = z.object({
    class_name: z.string().min(1, "class_name is required"),
    description: z.string().min(1, "description is required"),
    categories: z.array(z.string()).optional(),
    price: z.coerce.number().positive("price must be a positive number"),
})

const createClass = async (req, res) => {
    try{
        const newClass = createClassSchema.safeParse(req.body);

        const class_ = await Class.create(newClass);

        res.status(201).json({
            message: "student register success",
            data: {
                class: {
                    id: class_._id,
                    class_name: class_.name,
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
        const class_ = await Class.findById(req.params.id);
    }catch(e){
        console.log(e);
        res.status(500).json({
            "message": "Internal Server Error",
            "error": e
        })
    }
}


export {createClass}