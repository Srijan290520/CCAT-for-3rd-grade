import React from 'react';
import { Achievement } from '../types';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ achievements, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-heading"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform scale-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="achievement-heading" className="text-3xl font-extrabold text-yellow-500 mb-4">Achievement Unlocked!</h2>
        
        <div className="space-y-4 my-6">
            {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-gray-50 rounded-lg p-4 flex items-center">
                    <div className="text-5xl mr-4">{achievement.icon}</div>
                    <div className="text-left">
                        <h3 className="font-bold text-xl text-gray-800">{achievement.name}</h3>
                        <p className="text-gray-600">{achievement.description}</p>
                    </div>
                </div>
            ))}
        </div>

        <button 
          onClick={onClose}
          className="bg-green-500 text-white font-bold py-3 px-10 rounded-full text-xl hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;