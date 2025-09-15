
import React from 'react';
import { Category, UserData } from '../types';
import { CATEGORIES, ACHIEVEMENTS } from '../constants';
import Mascot from './Mascot';

interface HomeScreenProps {
  onStartQuiz: (category: Category) => void;
  onStartDailyPuzzle: () => void;
  onShowProgress: () => void;
  userData: UserData;
  dailyPuzzleCompleted: boolean;
  error: string | null;
  isDataReady: boolean;
}

const CategoryCard: React.FC<{ category: Category; onSelect: () => void; disabled: boolean; }> = ({ category, onSelect, disabled }) => (
  <button
    onClick={onSelect}
    disabled={disabled}
    aria-label={`Start ${category.name}`}
    className="group bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center w-full max-w-sm transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12 ${
      category.id === 'verbal' ? 'bg-purple-500' : category.id === 'quantitative' ? 'bg-green-500' : category.id === 'creative' ? 'bg-teal-500' : 'bg-orange-500'
    }`}>
      {category.icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">{category.name}</h3>
    <p className="text-gray-600">{category.description}</p>
  </button>
);

const StreakCounter: React.FC<{ label: string; count: number; icon: string }> = ({ label, count, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-4xl font-bold text-yellow-600">{count}</div>
    <div className="text-sm font-semibold text-gray-600 uppercase">{label}</div>
  </div>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ onStartQuiz, onStartDailyPuzzle, onShowProgress, userData, dailyPuzzleCompleted, error, isDataReady }) => {
  const totalAchievements = ACHIEVEMENTS.length;
  const unlockedAchievements = userData.unlockedAchievements.length;

  return (
    <div className="text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6">
        <Mascot status="greeting" />
        <div className="ml-4">
            <h1 className="text-5xl font-extrabold text-blue-600">CCAT Fun Practice!</h1>
        </div>
      </div>
      
       {/* Streaks and Daily Puzzle */}
      <div className="bg-blue-100 rounded-2xl p-6 mb-12 shadow-inner">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StreakCounter label="Current Streak" count={userData.currentStreak} icon="🔥" />
          <StreakCounter label="Best Streak" count={userData.bestStreak} icon="🏆" />
          <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <div className="text-4xl mb-2">🏅</div>
            <div className="text-4xl font-bold text-purple-600">{unlockedAchievements} <span className="text-2xl text-gray-500">/ {totalAchievements}</span></div>
            <div className="text-sm font-semibold text-gray-600 uppercase">Achievements</div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onStartDailyPuzzle}
              disabled={dailyPuzzleCompleted || !isDataReady}
              className="w-full bg-yellow-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {dailyPuzzleCompleted ? "Puzzle Complete!" : isDataReady ? "Start Today's Puzzle" : "Loading Puzzles..."}
            </button>
            <button
                onClick={onShowProgress}
                disabled={!isDataReady}
                className="w-full sm:w-auto bg-blue-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition-transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                View Progress
            </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-md" role="alert">
          <p className="font-bold">Oh no!</p>
          <p>{error}</p>
        </div>
      )}

      {/* Practice Zone */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-700 mb-6">Practice Zone</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORIES.map(category => (
            <CategoryCard key={category.id} category={category} onSelect={() => onStartQuiz(category)} disabled={!isDataReady} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;