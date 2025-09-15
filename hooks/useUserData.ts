


import { useState, useEffect, useCallback } from 'react';
import { UserData, PracticeCategoryId } from '../types';
import { isYesterday } from '../services/dateUtils';

const USER_DATA_KEY = 'ccatPracticeUserData';

type PerformanceUpdate = {
  subCategory: string;
  isCorrect: boolean;
};

const useUserData = () => {
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem(USER_DATA_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Ensure new fields exist for users with old data
        return {
            grade: null,
            currentStreak: 0,
            bestStreak: 0,
            lastCompletedDate: null,
            unlockedAchievements: [],
            performance: {},
            perfectScores: 0,
            totalCorrectAnswers: 0,
            ...parsed,
            quizCompletions: {
                verbal: 0, quantitative: 0, 'non-verbal': 0, smart: 0, creative: 0,
                ...(parsed.quizCompletions || {}),
            }
        };
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
    }
    // Default state for a new user
    return { 
      grade: null,
      currentStreak: 0, 
      bestStreak: 0, 
      lastCompletedDate: null,
      unlockedAchievements: [],
      quizCompletions: { verbal: 0, quantitative: 0, 'non-verbal': 0, smart: 0, creative: 0 },
      performance: {},
      perfectScores: 0,
      totalCorrectAnswers: 0,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } catch (error)
    {
      console.error("Failed to save user data to localStorage", error);
    }
  }, [userData]);

  const setGrade = useCallback((grade: number) => {
    setUserData(prevData => ({
      ...prevData,
      grade: grade,
    }));
  }, []);

  const completeDailyPuzzle = useCallback(() => {
    setUserData(prevData => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      if (prevData.lastCompletedDate === todayStr) {
        return prevData;
      }

      const newCurrentStreak = isYesterday(prevData.lastCompletedDate) ? prevData.currentStreak + 1 : 1;
      const newBestStreak = Math.max(prevData.bestStreak, newCurrentStreak);

      return {
        ...prevData,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: todayStr,
      };
    });
  }, []);
  
  const addQuizCompletion = useCallback((categoryId: PracticeCategoryId | 'smart') => {
      setUserData(prevData => ({
          ...prevData,
          quizCompletions: {
              ...prevData.quizCompletions,
              [categoryId]: (prevData.quizCompletions[categoryId] || 0) + 1,
          }
      }));
  }, []);

  const addAchievements = useCallback((achievementIds: string[]) => {
      if(achievementIds.length === 0) return;
      setUserData(prevData => {
          const newAchievements = achievementIds.filter(id => !prevData.unlockedAchievements.includes(id));
          if(newAchievements.length === 0) return prevData;
          return {
              ...prevData,
              unlockedAchievements: [...prevData.unlockedAchievements, ...newAchievements],
          };
      });
  }, []);

  const updatePerformance = useCallback((updates: PerformanceUpdate[]) => {
    setUserData(prevData => {
      const newPerformance = { ...prevData.performance };
      updates.forEach(update => {
        const { subCategory, isCorrect } = update;
        const current = newPerformance[subCategory] || { correct: 0, total: 0 };
        newPerformance[subCategory] = {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1,
        };
      });
      return { ...prevData, performance: newPerformance };
    });
  }, []);

  const incrementPerfectScores = useCallback(() => {
    setUserData(prevData => ({
        ...prevData,
        perfectScores: (prevData.perfectScores || 0) + 1,
    }));
  }, []);

  const addCorrectAnswers = useCallback((count: number) => {
    if (count === 0) return;
    setUserData(prevData => ({
        ...prevData,
        totalCorrectAnswers: (prevData.totalCorrectAnswers || 0) + count,
    }));
  }, []);


  return { userData, setGrade, completeDailyPuzzle, addQuizCompletion, addAchievements, updatePerformance, incrementPerfectScores, addCorrectAnswers };
};

export default useUserData;