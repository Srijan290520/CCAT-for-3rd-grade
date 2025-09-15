import React, { useState, useMemo } from 'react';
import { Question, Category, UserAnswer } from '../types';
import Mascot from './Mascot';
import ShapeRenderer from './ShapeRenderer';

interface QuizScreenProps {
  questions: Question[];
  category: Category;
  userAnswers: UserAnswer[];
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onComplete: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, category, userAnswers, onAnswerSelect, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = userAnswers.some(a => a.questionIndex === currentQuestionIndex);
  const isMultiQuestionQuiz = questions.length > 1;

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
    onAnswerSelect(currentQuestionIndex, answerIndex);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      onComplete();
    }
  };
  
  const mascotStatus = useMemo(() => {
    if (!isAnswered) return "thinking";
    const answer = userAnswers.find(a => a.questionIndex === currentQuestionIndex);
    return answer?.isCorrect ? "correct" : "incorrect";
  }, [isAnswered, userAnswers, currentQuestionIndex]);

  const progressPercentage = isMultiQuestionQuiz ? ((currentQuestionIndex) / questions.length) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl animate-fade-in-up">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-blue-600">{category.name}</h2>
            {isMultiQuestionQuiz && (
              <p className="text-lg font-semibold text-gray-700">Question {currentQuestionIndex + 1}/{questions.length}</p>
            )}
        </div>
        {isMultiQuestionQuiz && (
          <div className="w-full bg-gray-200 rounded-full h-4" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
            <div className="bg-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        )}
      </div>
      
      <div className="bg-blue-100 p-6 rounded-lg mb-6 min-h-[100px] flex items-center justify-center">
        <p className="text-2xl font-semibold text-center text-gray-800">{currentQuestion.question}</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6`}>
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswerIndex;
          const isSelected = selectedAnswer === index;
          
          let buttonClass = "bg-white hover:bg-yellow-100 border-2 border-yellow-400 text-yellow-600";
          if (isAnswered) {
             if (isCorrect) {
                buttonClass = "bg-green-500 border-green-700 text-white scale-105";
             } else if (isSelected) {
                buttonClass = "bg-red-500 border-red-700 text-white";
             } else {
                buttonClass = "bg-gray-200 border-gray-300 text-gray-500 opacity-70";
             }
          } else if(isSelected) {
            buttonClass = "bg-yellow-400 border-yellow-500 text-white";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={isAnswered}
              className={`p-4 rounded-lg shadow-sm text-lg font-semibold transition-all duration-300 transform ${buttonClass}`}
            >
              {currentQuestion.isImageBased ? <div className="flex justify-center"><ShapeRenderer description={option} /></div> : option}
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center min-h-[80px]">
          <Mascot status={mascotStatus} />
          {isAnswered && (
            <div className="ml-4 p-3 rounded-lg animate-fade-in" role="status">
              {userAnswers.find(a => a.questionIndex === currentQuestionIndex)?.isCorrect ? (
                <p className="text-xl font-bold text-green-600">Awesome!</p>
              ) : (
                <p className="text-xl font-bold text-red-600">Good try!</p>
              )}
            </div>
          )}
        </div>
        {isAnswered && (
          <button 
            onClick={handleNext} 
            className="bg-blue-600 text-white font-bold py-3 px-10 rounded-full text-xl hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg animate-fade-in"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : isMultiQuestionQuiz ? 'Finish' : 'Done'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizScreen;