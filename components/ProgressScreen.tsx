import React from 'react';
import { UserData, PracticeCategoryId } from '../types';
import { CATEGORIES, CATEGORY_SUBGROUPS } from '../constants';
import Mascot from './Mascot';

interface ProgressScreenProps {
  userData: UserData;
  onBack: () => void;
  onStartSmartPractice: () => void;
}

const ProgressBar: React.FC<{ correct: number, total: number, color: string }> = ({ correct, total, color }) => {
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    const bgColor = `bg-${color}-500`;
    return (
        <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
                className={`h-6 rounded-full ${bgColor} text-white text-xs font-bold flex items-center justify-center transition-all duration-500`}
                style={{ width: `${percentage}%` }}
            >
                {Math.round(percentage)}%
            </div>
        </div>
    );
};

const ProgressCard: React.FC<{ title: string; subCategory: string; stats: { correct: number, total: number } }> = ({ title, subCategory, stats }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold capitalize text-gray-700">{title}</p>
                <p className="text-sm font-semibold text-gray-600">{stats.correct} / {stats.total}</p>
            </div>
            <ProgressBar correct={stats.correct} total={stats.total} color="yellow" />
        </div>
    );
};


const ProgressScreen: React.FC<ProgressScreenProps> = ({ userData, onBack, onStartSmartPractice }) => {
    const { performance } = userData;
    const hasEnoughDataForSmartPractice = Object.values(performance).some(stats => stats.total >= 3);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="text-blue-600 font-bold text-lg hover:underline">&larr; Back to Home</button>
                <h1 className="text-4xl font-extrabold text-blue-600">Your Progress</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {CATEGORIES.map(category => {
                    const subCategories = CATEGORY_SUBGROUPS[category.id];
                    
                    const categoryTotals = subCategories.reduce((acc, sub) => {
                        const stats = performance[sub] || { correct: 0, total: 0 };
                        acc.correct += stats.correct;
                        acc.total += stats.total;
                        return acc;
                    }, { correct: 0, total: 0 });

                    return (
                        <div key={category.id} className="bg-blue-50 p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{category.name}</h2>
                            <div className="mb-4">
                                <p className="font-semibold text-center mb-2 text-gray-700">Overall Accuracy</p>
                                <ProgressBar correct={categoryTotals.correct} total={categoryTotals.total} color="blue" />
                            </div>
                            <div className="space-y-4">
                                {subCategories.map(sub => {
                                    const stats = performance[sub] || { correct: 0, total: 0 };
                                    return <ProgressCard key={sub} title={sub} subCategory={sub} stats={stats} />;
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center bg-green-50 p-8 rounded-2xl">
                <div className="flex justify-center items-center mb-4">
                    <Mascot status="thinking" />
                    <div className="ml-4 text-left">
                        <h3 className="text-3xl font-bold text-green-800">Ready for a Challenge?</h3>
                        <p className="text-green-700 text-lg">Let's work on the tricky stuff! I'll create a special quiz just for you.</p>
                    </div>
                </div>
                <button
                    onClick={onStartSmartPractice}
                    disabled={!hasEnoughDataForSmartPractice}
                    className="bg-green-500 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                >
                    Start Smart Practice
                </button>
                {!hasEnoughDataForSmartPractice && (
                    <p className="text-sm text-gray-500 mt-3">Keep practicing to unlock this feature! (You need to answer at least 3 questions in a skill.)</p>
                )}
            </div>
        </div>
    );
};

export default ProgressScreen;
