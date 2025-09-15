
import React from 'react';
import Mascot from './Mascot';
import { CreativeResult } from '../types';

interface CreativeResultScreenProps {
  result: CreativeResult;
  onPlayAgain: () => void;
}

const CreativeResultScreen: React.FC<CreativeResultScreenProps> = ({ result, onPlayAgain }) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center bg-white p-8 md:p-12 rounded-2xl shadow-2xl animate-fade-in-up flex flex-col items-center w-full max-w-3xl">
        <Mascot status="celebrating" large />
        <h2 className="text-4xl font-extrabold text-teal-600 mt-6 mb-2">Great Thinking!</h2>
        
        <div className="text-left w-full my-8 space-y-6">
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-bold text-gray-500 text-sm uppercase">The Challenge</p>
                <p className="text-lg text-gray-800 mt-1">{result.prompt}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-bold text-yellow-600 text-sm uppercase">Your Awesome Idea</p>
                <p className="text-lg text-yellow-800 mt-1">{result.answer}</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
                <p className="font-bold text-teal-600 text-sm uppercase">A Note From Your Coach</p>
                <p className="text-lg text-teal-800 mt-1">{result.feedback}</p>
            </div>
        </div>
        
        <button 
          onClick={onPlayAgain} 
          className="bg-green-500 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          Play Again!
        </button>
      </div>
    </div>
  );
};

export default CreativeResultScreen;
