import React from 'react';
// FIX: Import PracticeCategoryId for more specific typing.
import { Category, Difficulty, PracticeCategoryId, Achievement } from './types';

const BrainIcon = () => React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-12 w-12 text-white",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
  }));

const ShapesIcon = () => React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-12 w-12 text-white",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
  }));

const MathIcon = () => React.createElement('svg', {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-12 w-12 text-white",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M11 11V3m0 8h8m0 0l-8 8m8-8l-8-8"
  }));

// FIX: Use PracticeCategoryId to ensure only valid category IDs are passed for prompt generation.
const getPrompt = (categoryId: PracticeCategoryId, difficulty: Difficulty): string => {
    const baseInstruction = `Generate 90 questions suitable for a 3rd-grade student (around 8 years old) for a CCAT practice test. Provide 4 multiple choice options. The correct answer must be one of the options. For each question, provide a brief, simple explanation for a 3rd grader explaining why the correct answer is correct. For each question, also provide a 'subCategory' string from the allowed list for its main category.`;

    const subCategoryPrompts = {
      verbal: "Allowed subCategories: 'analogy', 'sentence completion', 'classification', 'synonym/antonym'.",
      quantitative: "Allowed subCategories: 'number pattern', 'word problem', 'basic arithmetic'.",
      'non-verbal': "Allowed subCategories: 'pattern completion', 'figure matrix', 'spatial reasoning'.",
    };

    const difficultyPrompts = {
        verbal: {
            easy: 'Focus on simple synonyms, antonyms, and direct object identification (e.g., "A dog is an animal, a rose is a ____.").',
            medium: 'Introduce simple analogies and sentence completions that require a small logical leap (e.g., "Glove is to hand as shoe is to ____.").',
            hard: 'Use more abstract analogies and "what does not belong" questions that require classification (e.g., "Which does not belong: car, boat, bicycle, house?").'
        },
        quantitative: {
            easy: 'Focus on simple one-step addition/subtraction word problems and basic number patterns (e.g., 2, 4, 6, __).',
            medium: 'Include two-step word problems, slightly more complex patterns, and simple multiplication/division concepts.',
            hard: 'Use multi-step word problems that require careful reading, and number patterns that involve both addition and subtraction or other rules.'
        },
        'non-verbal': {
            easy: `The patterns should involve a single, simple progression of one attribute only (e.g., color OR shape OR quantity). Example: "A red square, a blue square, a green square..."`,
            medium: `The patterns should involve a progression of TWO attributes changing simultaneously (e.g., shape and color, or rotation and size). Example: "A small red circle, a medium blue square, a large green triangle..."`,
            hard: `The patterns should be more complex, involving matrix-style logic (e.g., what fits in a 3x3 grid) or sequences where elements are added or removed based on a rule.`
        }
    };
    
    const nonVerbalRules = `\n
**CRITICAL RULES for generating non-verbal options:**
1.  **Generate 4 multiple-choice options** for each question.
2.  Each option MUST be a simple text description of one or more shapes.
3.  **Options MUST be visually distinct and unique.** Do NOT provide two options that look the same, like 'A blue circle' and 'One blue circle'.
4.  **Use a specific vocabulary for descriptions:**
    *   **Quantity:** 'One', 'Two', 'Three', 'Four'.
    *   **Size (optional):** 'small', 'big'.
    *   **State (optional):** 'filled', 'empty'.
    *   **Color:** 'red', 'blue', 'green', 'yellow'.
    *   **Shape:** 'square', 'circle', 'triangle', 'star'.
    *   **Example format:** 'One small filled red square', 'Two big empty blue circles'.
5.  There must be **only ONE logically correct answer** among the options.
6.  The \`correctAnswerIndex\` MUST point to this single correct answer.`;

    const difficultyInstruction = difficultyPrompts[categoryId][difficulty];
    const subCategoryInstruction = subCategoryPrompts[categoryId];
    const finalPrompt = `${baseInstruction}\n\n**Category: ${categoryId.toUpperCase()}**\n${subCategoryInstruction}\n\n**Difficulty: ${difficulty.toUpperCase()}**\n${difficultyInstruction}`;
    
    return categoryId === 'non-verbal' ? finalPrompt + nonVerbalRules : finalPrompt;
};

export { getPrompt };

// FIX: Corrected the type of CATEGORIES to be more specific and accurate.
export const CATEGORIES: (Category & { id: 'verbal' | 'quantitative' | 'non-verbal' })[] = [
  {
    id: 'verbal',
    name: 'Verbal Puzzles',
    description: 'Find relationships between words and complete sentences.',
    icon: React.createElement(BrainIcon),
  },
  {
    id: 'quantitative',
    name: 'Number Games',
    description: 'Solve number series, patterns, and fun math problems.',
    icon: React.createElement(MathIcon),
  },
  {
    id: 'non-verbal',
    name: 'Shape Mysteries',
    description: 'Discover patterns and sequences with shapes and figures.',
    icon: React.createElement(ShapesIcon),
  },
];

export const TOTAL_QUESTIONS_PER_QUIZ = 5;

// FIX: Corrected typo in constant name from ACHIEVements to ACHIEVEMENTS.
export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_quiz', name: 'First Steps', description: 'Complete your first practice quiz.', icon: '🎉' },
    { id: 'perfect_score', name: 'Perfect Score!', description: 'Get a 100% score on any practice quiz.', icon: '🎯' },
    { id: 'daily_puzzle', name: 'Daily Dedication', description: 'Complete your first daily puzzle.', icon: '📅' },
    { id: 'streak_5', name: 'On Fire!', description: 'Reach a 5-day streak.', icon: '🔥' },
    { id: 'verbal_10', name: 'Verbal Virtuoso', description: 'Complete 10 Verbal Puzzles.', icon: '🧠' },
    { id: 'quant_10', name: 'Number Ninja', description: 'Complete 10 Number Games.', icon: '🔢' },
    { id: 'nonverbal_10', name: 'Shape Sleuth', description: 'Complete 10 Shape Mysteries.', icon: '🔷' },
    { id: 'streak_15', name: 'Unstoppable!', description: 'Reach a 15-day streak.', icon: '🚀' },
];

// For Progress Screen
export const CATEGORY_SUBGROUPS: Record<PracticeCategoryId, string[]> = {
    'verbal': ['analogy', 'sentence completion', 'classification', 'synonym/antonym'],
    'quantitative': ['number pattern', 'word problem', 'basic arithmetic'],
    'non-verbal': ['pattern completion', 'figure matrix', 'spatial reasoning']
};