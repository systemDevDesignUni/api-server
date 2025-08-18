import Chapter from '../models/Chapter.js'
import {z} from 'zod'

const chapterRegSchema = {
    class_id : z.string(),
    chapter_url : z.array(z.string()),
    chapter_name : z.string(),
    chapter_description : z.string().optional(),
    chapter_notes : z.array(z.string()),

}






