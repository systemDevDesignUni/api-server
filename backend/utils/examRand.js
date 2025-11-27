let exams_rand_answers = {};


const storeExamAnswers = (exam_id, correct_answers_json) => {
    exams_rand_answers[exam_id] = JSON.parse(correct_answers_json); 
    return true;
};


function compareAnswers(correct_answers, user_answers) {
    let correct_mcq_count = 0;

    // correct_answers = {1:4, 2:1, 3:2, 4:2}
    // user_answers    = {1:4, 2:3, 3:2, 4:2}

    for (const question_id in correct_answers) {
        const correct_answer = correct_answers[question_id];
        const user_answer = user_answers[question_id];

        if (user_answer && user_answer == correct_answer) {
            correct_mcq_count++;
        }
    }

    return correct_mcq_count;
}


const checkMcqAnswers = (exam_id, user_answers_json) => {
    const correct = exams_rand_answers[exam_id];
    const user = JSON.parse(user_answers_json);

    return compareAnswers(correct, user);
};

export { storeExamAnswers, checkMcqAnswers };
