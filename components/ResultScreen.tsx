import React, { useMemo } from 'react';
import Mascot from './Mascot';
import { Question, UserAnswer } from '../types';
import ShapeRenderer from './ShapeRenderer';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  questions: Question[];
  userAnswers: UserAnswer[];
  onPlayAgain: () => void;
}

const AnswerReviewCard: React.FC<{ question: Question; userAnswerIndex: number }> = ({ question, userAnswerIndex }) => {
  const userAnswer = question.options[userAnswerIndex];
  const correctAnswer = question.options[question.correctAnswerIndex];

  return (
    <div className="bg-gray-50 rounded-xl p-5 shadow-sm text-left animate-fade-in-up">
      <p className="font-semibold text-lg text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: `Q: ${question.question}` }}></p>
      
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-red-600 mb-1">Your Answer:</p>
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800">
            {question.isImageBased ? <ShapeRenderer description={userAnswer} /> : userAnswer}
          </div>
        </div>
        
        <div>
          <p className="text-sm font-bold text-green-600 mb-1">Correct Answer:</p>
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-800">
            {question.isImageBased ? <ShapeRenderer description={correctAnswer} /> : correctAnswer}
          </div>
        </div>
      </div>

      {question.explanation && (
        <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="font-bold text-blue-800 flex items-center"><span className="text-xl mr-2">💡</span> Explanation</p>
          <p className="text-blue-700 mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};


const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions, questions, userAnswers, onPlayAgain }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const incorrectAnswers = userAnswers.filter(answer => !answer.isCorrect);

  const { message, mascotStatus } = useMemo(() => {
    if (percentage === 100) {
      return { message: "Perfect Score! You're a genius!", mascotStatus: "celebrating" as const };
    } else if (percentage >= 75) {
      return { message: "Wow, great job! You're so smart!", mascotStatus: "correct" as const };
    } else if (percentage >= 50) {
      return { message: "Nice work! Keep practicing!", mascotStatus: "greeting" as const };
    } else {
      return { message: "You gave it a good try! Let's play again!", mascotStatus: "thinking" as const };
    }
  }, [percentage]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center bg-white p-8 md:p-12 rounded-2xl shadow-2xl animate-fade-in-up flex flex-col items-center w-full">
        <Mascot status={mascotStatus} large />
        <h2 className="text-4xl font-extrabold text-blue-600 mt-6 mb-2">Quiz Complete!</h2>
        <p className="text-2xl text-gray-700 mb-4">{message}</p>
        
        <div className="bg-yellow-100 border-4 border-yellow-300 rounded-xl p-6 my-8">
          <p className="text-xl text-yellow-800">You answered</p>
          <p className="text-7xl font-bold text-yellow-600 my-2">{score} <span className="text-4xl font-semibold">/ {totalQuestions}</span></p>
          <p className="text-xl text-yellow-800">questions correctly!</p>
        </div>
        
        <button 
          onClick={onPlayAgain} 
          className="bg-green-500 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          Play Again!
        </button>
      </div>

      {incorrectAnswers.length > 0 && (
        <div className="mt-12 w-full">
          <h3 className="text-3xl font-bold text-gray-700 mb-6 text-center">Review Your Answers</h3>
          <div className="space-y-6">
            {incorrectAnswers.map(answer => {
              const question = questions[answer.questionIndex];
              if (!question) return null;
              return (
                <AnswerReviewCard
                  key={answer.questionIndex}
                  question={question}
                  userAnswerIndex={answer.answerIndex}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;