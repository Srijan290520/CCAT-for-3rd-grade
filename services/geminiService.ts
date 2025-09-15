import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import PracticeCategoryId for stricter type checking.
import { Category, Question, AllQuestions, Difficulty, PracticeCategoryId } from '../types';
import { CATEGORIES, getPrompt } from "../constants";

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
export const generateQuestionsForCategory = async (category: Pick<Category, 'name'> & { id: PracticeCategoryId }, difficulty: Difficulty): Promise<Question[]> => {
  try {
    const prompt = getPrompt(category.id, difficulty);
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

export const fetchAllCategoryQuestions = async (difficulty: Difficulty): Promise<AllQuestions> => {
    const questionPromises = CATEGORIES.map(category => generateQuestionsForCategory(category, difficulty));
    const results = await Promise.allSettled(questionPromises);

    const allQuestions: AllQuestions = {
        verbal: [],
        quantitative: [],
        'non-verbal': [],
    };
    
    const errors: string[] = [];
    
    results.forEach((result, index) => {
        const category = CATEGORIES[index];
        // FIX: Removed incorrect type comparison, as CATEGORIES only contains practice categories.
        // The 'daily' category is handled separately in App.tsx.

        if (result.status === 'fulfilled') {
            allQuestions[category.id] = result.value;
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
