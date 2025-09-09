"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSurveyWithQuestions = exports.surveyService = void 0;
const surveyModel_1 = require("../models/surveyModel");
const uuid_1 = require("uuid");
class SurveyService {
    async getAllSurveySubmissions() {
        return await (0, surveyModel_1.getAllSurveySubmissions)();
    }
    async createSurvey(title, description) {
        return await (0, surveyModel_1.createSurvey)({ title, description });
    }
    async createSurveyWithQuestions(title, description, questions = []) {
        const survey = await (0, surveyModel_1.createSurvey)({ title, description });
        if (questions && Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await (0, surveyModel_1.createQuestion)({
                    survey_id: survey.id,
                    title: q.text || q.title || '',
                    description: q.description || '',
                    question_type: q.type || q.question_type || 'text',
                    options: q.options || null,
                    required: q.required || false,
                    order_index: i
                });
            }
        }
        const fullSurvey = await this.getSurveyWithQuestions(survey.id);
        return fullSurvey;
    }
    async getAllSurveys() {
        return await (0, surveyModel_1.getSurveys)();
    }
    async getSurvey(id) {
        return await (0, surveyModel_1.getSurveyById)(id);
    }
    async getSurveyWithQuestions(id) {
        const survey = await (0, surveyModel_1.getSurveyById)(id);
        if (!survey)
            return null;
        const questions = await (0, surveyModel_1.getQuestionsBySurveyId)(id);
        return { ...survey, questions };
    }
    async addQuestionToSurvey(surveyId, title, questionType, description, options, required = false) {
        const existingQuestions = await (0, surveyModel_1.getQuestionsBySurveyId)(surveyId);
        const orderIndex = existingQuestions.length;
        return await (0, surveyModel_1.createQuestion)({
            survey_id: surveyId,
            title,
            description,
            question_type: questionType,
            options,
            required,
            order_index: orderIndex
        });
    }
    async getQuestions(surveyId) {
        return await (0, surveyModel_1.getQuestionsBySurveyId)(surveyId);
    }
    async submitSurveyResponse(surveyId, responses, userId) {
        const sessionId = (0, uuid_1.v4)();
        const submission = await (0, surveyModel_1.createSurveySubmission)({
            survey_id: surveyId,
            user_id: userId,
            session_id: sessionId
        });
        for (const response of responses) {
            await (0, surveyModel_1.createResponse)({
                survey_id: surveyId,
                question_id: response.questionId,
                user_id: userId,
                session_id: sessionId,
                answer: response.answer
            });
        }
        return { sessionId, submissionId: submission.id };
    }
    async getSurveySubmission(sessionId) {
        return await (0, surveyModel_1.getSurveySubmissionBySession)(sessionId);
    }
    async getResponsesForSession(sessionId) {
        return await (0, surveyModel_1.getResponsesBySession)(sessionId);
    }
    async createSampleSurvey() {
        const survey = await this.createSurvey("User Demographics Survey", "Help us understand our users better by providing some demographic information");
        await this.addQuestionToSurvey(survey.id, "What is your full name?", "text", "Please enter your first and last name", undefined, true);
        await this.addQuestionToSurvey(survey.id, "What is your email address?", "email", "We'll use this to contact you if needed", undefined, true);
        await this.addQuestionToSurvey(survey.id, "What is your age?", "number", "Please enter your age in years", undefined, true);
        await this.addQuestionToSurvey(survey.id, "What is your current employment status?", "radio", "Select the option that best describes your current situation", ["Employed full-time", "Employed part-time", "Self-employed", "Unemployed", "Student", "Retired"], true);
        await this.addQuestionToSurvey(survey.id, "Which of these best describes your household income?", "select", "Select your annual household income range", ["Under 25,000", "25,000 - 49,999", "50,000 - 74,999", "75,000 - 99,999", "100,000 - 149,999", "150,000+", "Prefer not to say"]);
        await this.addQuestionToSurvey(survey.id, "Do you have any chronic health conditions?", "checkbox", "Check all that apply", ["Diabetes", "Heart disease", "High blood pressure", "Arthritis", "Depression/Anxiety", "Asthma", "None of the above"]);
        await this.addQuestionToSurvey(survey.id, "Tell us about your long-term care concerns", "textarea", "What concerns you most about potential future care needs? (Optional)");
        return survey;
    }
}
exports.surveyService = new SurveyService();
exports.createSurveyWithQuestions = exports.surveyService.createSurveyWithQuestions.bind(exports.surveyService);
