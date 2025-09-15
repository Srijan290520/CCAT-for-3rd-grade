

import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import PracticeCategoryId for stricter type checking.
import { Category, Question, AllQuestions, Difficulty, PracticeCategoryId, UserData, CreativeQuestion } from '../types';
import { CATEGORIES, getPrompt, getGradeText } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: {
        type: Type.STRING,
        description: 'The question text or a description of the visual pattern.',
      },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'An array of 4 unique and visually distinct possible answers as strings. There should be no duplicate options.',
      },
      isImageBased: {
        type: Type.BOOLEAN,
        description: 'True if the question and/or options are descriptions of visual patterns/shapes, false for text-based questions.',
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: 'The 0-based index of the single, unambiguously correct option in the options array. This must be accurate.',
      },
      explanation: {
        type: Type.STRING,
        description: 'A brief, simple explanation for a 3rd grader explaining why the correct answer is correct.',
      },
      subCategory: {
        type: Type.STRING,
        description: "The specific sub-category for this question based on the provided list."
      }
    },
    required: ['question', 'options', 'isImageBased', 'correctAnswerIndex', 'explanation', 'subCategory'],
    propertyOrdering: ["question", "options", "isImageBased", "correctAnswerIndex", "explanation", "subCategory"],
  },
};

// FIX: Updated function signature to only accept practice categories, preventing incorrect calls.
export const generateQuestionsForCategory = async (category: Pick<Category, 'name'> & { id: 'verbal' | 'quantitative' | 'non-verbal' }, difficulty: Difficulty, grade: number): Promise<Question[]> => {
  try {
    const prompt = getPrompt(category.id, difficulty, grade);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsedData = JSON.parse(cleanedJsonText);

    if (!Array.isArray(parsedData)) {
      throw new Error(`API did not return a valid array for ${category.name}.`);
    }

    return parsedData.filter(q => 
        q.question && Array.isArray(q.options) && q.options.length > 0 && typeof q.correctAnswerIndex === 'number' && q.explanation && q.subCategory
    ) as Question[];
  } catch (error) {
    console.error(`Error generating questions for ${category.name}:`, error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error('The API key is invalid. Please check your configuration.');
    }
    throw new Error(`Failed to generate ${category.name} questions from the AI.`);
  }
};

export const fetchAllCategoryQuestions = async (difficulty: Difficulty, grade: number): Promise<AllQuestions> => {
    const questionPromises = CATEGORIES.filter(c => c.id !== 'creative').map(category => generateQuestionsForCategory(category as any, difficulty, grade));
    const results = await Promise.allSettled(questionPromises);

    const allQuestions: AllQuestions = {
        verbal: [],
        quantitative: [],
        'non-verbal': [],
    };
    
    const errors: string[] = [];
    
    results.forEach((result, index) => {
        const category = CATEGORIES[index];
        if (result.status === 'fulfilled') {
            allQuestions[category.id as 'verbal' | 'quantitative' | 'non-verbal'] = result.value as Question[];
        } else {
            console.error(`Failed to fetch questions for ${category.id}:`, result.reason);
            errors.push(category.name);
        }
    });

    if (errors.length > 0) {
        throw new Error(`Failed to fetch questions for the following categories: ${errors.join(', ')}.`);
    }

    return allQuestions;
};

export const generateCreativePrompt = async (grade: number): Promise<CreativeQuestion> => {
    const gradeText = getGradeText(grade);
    const prompt = `Generate one short, simple, creative, open-ended question appropriate for a ${gradeText} grader. It should be a single sentence. The goal is to elicit a single sentence response. Example: "If clouds had flavors, what would a puffy white cloud taste like?" or "What sound would a star make if you could hear it?"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return { prompt: response.text };
    } catch (error) {
        console.error("Error generating creative prompt:", error);
        throw new Error("Could not generate a creative prompt.");
    }
};

export const evaluateCreativeAnswer = async (prompt: string, answer: string, grade: number): Promise<string> => {
    const gradeText = getGradeText(grade);
    const evaluationPrompt = `A ${gradeText} grader was given the prompt: "${prompt}". They answered: "${answer}". Act as a friendly, encouraging teacher. Provide one or two sentences of positive and constructive feedback. Focus on creativity and effort, not grammar. Do not give a score.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: evaluationPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error evaluating creative answer:", error);
        throw new Error("Could not evaluate the creative answer.");
    }
};

export const generateProgressSummary = async (performance: UserData['performance'], grade: number): Promise<string> => {
    if (Object.keys(performance).length === 0) {
        return "You're just getting started! Complete some quizzes to see your progress summary here.";
    }
    const gradeText = getGradeText(grade);
    const prompt = `You are an AI learning coach named Sparky. Here is a student's performance data in a CCAT practice app: ${JSON.stringify(performance)}. Provide a short, encouraging summary (2-3 sentences) for the student. Highlight one area of strength (a subCategory with high accuracy) and suggest one specific skill to practice next (a subCategory with lower accuracy). The student is in ${gradeText} grade. Keep the tone positive and helpful. Use emojis.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating progress summary:", error);
        throw new Error("Could not generate a progress summary.");
    }
};
