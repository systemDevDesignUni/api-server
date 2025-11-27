let exam_session = {};   

function generateRandomId() {
    const id = Math.random().toString(36).substring(2, 15);

    if (exam_session[id]) {
        return generateRandomId(); 
    }
    return id;
}

const createSessionId = (student_id,exam_id, duration_minutes) => {
    const now = new Date();
    
    const expire_at = new Date(now.getTime() + duration_minutes * 60000);  // expiration time as a Date object

    const sessId = generateRandomId();

    exam_session[sessId] = {
        student_id: student_id,
        exam_id:exam_id,
        expire_at: expire_at
    };

    return sessId;
};

const getSessionId = (session_id) => {
    const session = exam_session[session_id]

    if(!session){
        return false
    }

    const now = new Date();
    const current_time = new Date(now.getTime * 60000);
    if(session.expire_at < current_time){
        return false
    }

    return true
}

export {createSessionId, getSessionId}