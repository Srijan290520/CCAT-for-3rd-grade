
import React, { useState } from 'react';
import Mascot from './Mascot';

interface CreativeQuizScreenProps {
  prompt: string;
  onSubmit: (answer: string) => void;
}

const CreativeQuizScreen: React.FC<CreativeQuizScreenProps> = ({ prompt, onSubmit }) => {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer.trim());
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="text-center mb-8">
                <Mascot status="thinking" />
                <h2 className="text-2xl font-bold text-teal-600 mt-4">Creative Challenge</h2>
            </div>
            
            <div className="bg-teal-100 p-6 rounded-lg mb-6 min-h-[100px] flex items-center justify-center">
                <p className="text-2xl font-semibold text-center text-gray-800">{prompt}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Write your creative answer here..."
                    className="w-full h-40 p-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-teal-500"
                    aria-label="Your answer"
                />
                <div className="text-center mt-6">
                    <button
                        type="submit"
                        disabled={!answer.trim()}
                        className="bg-teal-500 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-teal-600 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        Submit My Idea!
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreativeQuizScreen;
