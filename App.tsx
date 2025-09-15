
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { fetchAllCategoryQuestions } from './services/geminiService';
import { Category, GameState, Question, UserAnswer, AllQuestions, CachedQuestions, Difficulty, Achievement, PracticeCategoryId } from './types';
import useUserData from './hooks/useUserData';
import { isToday, getDayOfYear } from './services/dateUtils';
import { CATEGORIES, TOTAL_QUESTIONS_PER_QUIZ, ACHIEVEMENTS } from './constants';
import LoadingSpinner from './components/LoadingSpinner';
import AchievementNotification from './components/AchievementNotification';
import ProgressScreen from './components/ProgressScreen';

// Shuffles an array and returns a new shuffled array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

const getDifficultyLevel = (streak: number): Difficulty => {
  if (streak >= 15) return 'hard';
  if (streak >= 5) return 'medium';
  return 'easy';
};

const App: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.Home);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Data fetching state
  const [allQuestions, setAllQuestions] = useState<AllQuestions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Achievement state
  const [showcasedAchievements, setShowcasedAchievements] = useState<Achievement[]>([]);

  // User streak data
  const { userData, completeDailyPuzzle, addQuizCompletion, addAchievements, updatePerformance } = useUserData();

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      setError(null);
      const todayStr = new Date().toISOString().split('T')[0];
      const difficulty = getDifficultyLevel(userData.currentStreak);
      const questionsCacheKey = `ccatDailyQuestionsCache-v3-${difficulty}`;

      try {
        const cachedDataRaw = localStorage.getItem(questionsCacheKey);
        if (cachedDataRaw) {
          const cachedData: CachedQuestions = JSON.parse(cachedDataRaw);
          if (cachedData.date === todayStr && cachedData.questions) {
            setAllQuestions(cachedData.questions);
            setIsLoading(false);
            return;
          }
        }

        const fetchedQuestions = await fetchAllCategoryQuestions(difficulty);
        
        setAllQuestions(fetchedQuestions);
        const newCache: CachedQuestions = { date: todayStr, questions: fetchedQuestions };
        localStorage.setItem(questionsCacheKey, JSON.stringify(newCache));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Could not load questions. ${errorMessage} Please ensure your API key is correct and try again.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [userData.currentStreak]);

  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const isPracticeQuiz = useMemo(() => currentCategory?.id !== 'daily', [currentCategory]);
  const isDailyPuzzle = useMemo(() => questions.length === 1 && currentCategory?.id === 'daily', [questions, currentCategory]);
  const dailyPuzzleCompleted = useMemo(() => isToday(userData.lastCompletedDate), [userData.lastCompletedDate]);

  // Check for achievements whenever user data changes
  useEffect(() => {
    const checkAndUnlockAchievements = () => {
        const { currentStreak, quizCompletions, unlockedAchievements } = userData;
        const newAchievements: string[] = [];

        // Streak achievements
        if (currentStreak >= 5 && !unlockedAchievements.includes('streak_5')) newAchievements.push('streak_5');
        if (currentStreak >= 15 && !unlockedAchievements.includes('streak_15')) newAchievements.push('streak_15');

        // Quiz completion achievements
        if (quizCompletions.verbal >= 10 && !unlockedAchievements.includes('verbal_10')) newAchievements.push('verbal_10');
        if (quizCompletions.quantitative >= 10 && !unlockedAchievements.includes('quant_10')) newAchievements.push('quant_10');
        if (quizCompletions['non-verbal'] >= 10 && !unlockedAchievements.includes('nonverbal_10')) newAchievements.push('nonverbal_10');

        if (newAchievements.length > 0) {
            addAchievements(newAchievements);
            const achievementDetails = ACHIEVEMENTS.filter(ach => newAchievements.includes(ach.id));
            setShowcasedAchievements(prev => [...prev, ...achievementDetails]);
        }
    };
    checkAndUnlockAchievements();
  }, [userData, addAchievements]);


  const handleStartPracticeQuiz = useCallback((category: Category) => {
    if (!allQuestions || category.id === 'daily' || category.id === 'smart') return;

    const questionPool = allQuestions[category.id] || [];
    const shuffled = shuffleArray(questionPool);
    const quizQuestions = shuffled.slice(0, TOTAL_QUESTIONS_PER_QUIZ);
    
    setCurrentCategory(category);
    setQuestions(quizQuestions);
    setUserAnswers([]);
    setGameState(GameState.Quiz);
  }, [allQuestions]);

  const handleStartDailyPuzzle = useCallback(() => {
    if (!allQuestions) return;

    const combinedPool = [...allQuestions.verbal, ...allQuestions.quantitative, ...allQuestions['non-verbal']];
    if(combinedPool.length === 0) return;
    
    const dayOfYear = getDayOfYear();
    const puzzleIndex = dayOfYear % combinedPool.length;
    const puzzle = combinedPool[puzzleIndex];

    const dailyCategory: Category = {
      id: 'daily',
      name: 'Daily Puzzle',
      description: 'A special challenge for today!',
      icon: <></>, // Icon not needed for quiz screen title
    };
    setCurrentCategory(dailyCategory);
    setQuestions([puzzle]);
    setUserAnswers([]);
    setGameState(GameState.Quiz);
  }, [allQuestions]);

  const handleStartSmartPracticeQuiz = useCallback(() => {
    if (!allQuestions) return;

    const allPracticeQuestions = [...allQuestions.verbal, ...allQuestions.quantitative, ...allQuestions['non-verbal']];
    const { performance } = userData;
  
    // Identify weak sub-categories
    const weakSubCategories = Object.entries(performance)
      .filter(([, stats]) => stats.total >= 3) // Only consider categories with enough data
      .map(([subCategory, stats]) => ({
        subCategory,
        accuracy: stats.correct / stats.total,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3) // Target the 3 weakest areas
      .map(item => item.subCategory);
  
    let quizQuestions: Question[] = [];
  
    if (weakSubCategories.length > 0) {
      // Get 3-4 questions from weak areas
      const weakQuestions = shuffleArray(allPracticeQuestions.filter(q => weakSubCategories.includes(q.subCategory))).slice(0, 3);
      quizQuestions.push(...weakQuestions);
    }
  
    // Fill the rest of the quiz with random questions
    const remainingSlots = TOTAL_QUESTIONS_PER_QUIZ - quizQuestions.length;
    const randomQuestions = shuffleArray(allPracticeQuestions.filter(q => !quizQuestions.some(qq => qq.question === q.question))).slice(0, remainingSlots);
    quizQuestions.push(...randomQuestions);

    // If still not enough, just grab any 5
    if (quizQuestions.length < TOTAL_QUESTIONS_PER_QUIZ) {
        quizQuestions = shuffleArray(allPracticeQuestions).slice(0, TOTAL_QUESTIONS_PER_QUIZ);
    }
  
    const smartCategory: Category = {
      id: 'smart',
      name: 'Smart Practice',
      description: 'A special quiz focused on your weak spots!',
      icon: <></>,
    };
    
    setCurrentCategory(smartCategory);
    setQuestions(shuffleArray(quizQuestions));
    setUserAnswers([]);
    setGameState(GameState.Quiz);
  }, [allQuestions, userData]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const question = questions[questionIndex];
    const isCorrect = question.correctAnswerIndex === answerIndex;
    setUserAnswers(prev => [...prev, { questionIndex, answerIndex, isCorrect }]);
  };

  const handleQuizComplete = () => {
    const newAchievements: string[] = [];

    // Update performance stats
    if (isPracticeQuiz) {
        const performanceUpdates = userAnswers.map(answer => ({
            subCategory: questions[answer.questionIndex].subCategory,
            isCorrect: answer.isCorrect,
        }));
        updatePerformance(performanceUpdates);
    }
    
    if (isDailyPuzzle) {
      const answer = userAnswers[0];
      if (answer.isCorrect) {
        completeDailyPuzzle();
        if(!userData.unlockedAchievements.includes('daily_puzzle')) {
            newAchievements.push('daily_puzzle');
        }
      }
    }
    
    if (isPracticeQuiz) {
      // FIX: Corrected typing logic to prevent a comparison error.
      // Instead of an early assertion, we let TypeScript narrow the type of categoryId.
      const categoryId = currentCategory?.id;
      if (categoryId && (categoryId === 'verbal' || categoryId === 'quantitative' || categoryId === 'non-verbal')) {
          addQuizCompletion(categoryId);
      }
      const totalQuizzes = Object.values(userData.quizCompletions).reduce((a, b) => a + b, 0);
      if (totalQuizzes === 0 && !userData.unlockedAchievements.includes('first_quiz')) {
        newAchievements.push('first_quiz');
      }
      if (score === TOTAL_QUESTIONS_PER_QUIZ && !userData.unlockedAchievements.includes('perfect_score')) {
        newAchievements.push('perfect_score');
      }
    }

    if (newAchievements.length > 0) {
        addAchievements(newAchievements);
        const achievementDetails = ACHIEVEMENTS.filter(ach => newAchievements.includes(ach.id));
        setShowcasedAchievements(achievementDetails);
    }
    
    if (isDailyPuzzle) {
        handlePlayAgain(); // Daily puzzle goes straight home
    } else {
        setGameState(GameState.Results);
    }
  };

  const handlePlayAgain = () => {
    setGameState(GameState.Home);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentCategory(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner message="Preparing a fresh set of questions for today..." />;
    }
    
    switch (gameState) {
      case GameState.Quiz:
        return (
          <QuizScreen
            questions={questions}
            category={currentCategory!}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
            onComplete={handleQuizComplete}
          />
        );
      case GameState.Results:
        return (
          <ResultScreen
            score={score}
            totalQuestions={questions.length}
            questions={questions}
            userAnswers={userAnswers}
            onPlayAgain={handlePlayAgain}
          />
        );
      case GameState.Progress:
          return (
              <ProgressScreen 
                userData={userData}
                onBack={() => setGameState(GameState.Home)}
                onStartSmartPractice={handleStartSmartPracticeQuiz}
              />
          );
      case GameState.Home:
      default:
        return (
          <HomeScreen 
            onStartPracticeQuiz={handleStartPracticeQuiz} 
            onStartDailyPuzzle={handleStartDailyPuzzle}
            onShowProgress={() => setGameState(GameState.Progress)}
            userData={userData}
            dailyPuzzleCompleted={dailyPuzzleCompleted}
            error={error} 
            isDataReady={!!allQuestions}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-gray-800">
      <main className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </main>
      {showcasedAchievements.length > 0 && (
          <AchievementNotification 
            achievements={showcasedAchievements}
            onClose={() => setShowcasedAchievements([])}
          />
      )}
    </div>
  );
};

export default App;
