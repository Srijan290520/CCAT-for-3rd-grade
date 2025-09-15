

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { fetchAllCategoryQuestions, generateCreativePrompt, evaluateCreativeAnswer } from './services/geminiService';
import { Category, GameState, Question, UserAnswer, AllQuestions, CachedQuestions, Difficulty, Achievement, PracticeCategoryId, CreativeQuestion, CreativeResult } from './types';
import useUserData from './hooks/useUserData';
import { isToday, getDayOfYear } from './services/dateUtils';
import { CATEGORIES, TOTAL_QUESTIONS_PER_QUIZ, ACHIEVEMENTS } from './constants';
import LoadingSpinner from './components/LoadingSpinner';
import AchievementNotification from './components/AchievementNotification';
import ProgressScreen from './components/ProgressScreen';
import GradeSelectionScreen from './components/GradeSelectionScreen';
import TutorChatScreen from './components/TutorChatScreen';
import CreativeQuizScreen from './components/CreativeQuizScreen';
import CreativeResultScreen from './components/CreativeResultScreen';

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
  const { userData, setGrade, completeDailyPuzzle, addQuizCompletion, addAchievements, updatePerformance, incrementPerfectScores, addCorrectAnswers } = useUserData();

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => userData.grade ? GameState.Home : GameState.GradeSelection);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Data fetching state
  const [allQuestions, setAllQuestions] = useState<AllQuestions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!userData.grade);
  const [error, setError] = useState<string | null>(null);
  
  // Achievement state
  const [showcasedAchievements, setShowcasedAchievements] = useState<Achievement[]>([]);

  // Feature-specific state
  const [tutorContext, setTutorContext] = useState<{ question: Question; userAnswer: UserAnswer } | null>(null);
  const [creativeQuestion, setCreativeQuestion] = useState<CreativeQuestion | null>(null);
  const [creativeResult, setCreativeResult] = useState<CreativeResult | null>(null);
  const [isCreativeLoading, setIsCreativeLoading] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!userData.grade) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const todayStr = new Date().toISOString().split('T')[0];
      const difficulty = getDifficultyLevel(userData.currentStreak);
      const questionsCacheKey = `ccatDailyQuestionsCache-v4-${userData.grade}-${difficulty}`;

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

        const fetchedQuestions = await fetchAllCategoryQuestions(difficulty, userData.grade);
        
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
  }, [userData.currentStreak, userData.grade]);

  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const isPracticeQuiz = useMemo(() => currentCategory?.id !== 'daily', [currentCategory]);
  const isDailyPuzzle = useMemo(() => questions.length === 1 && currentCategory?.id === 'daily', [questions, currentCategory]);
  const dailyPuzzleCompleted = useMemo(() => isToday(userData.lastCompletedDate), [userData.lastCompletedDate]);

  useEffect(() => {
    const checkAndUnlockAchievements = () => {
        const { currentStreak, quizCompletions, unlockedAchievements, perfectScores, totalCorrectAnswers } = userData;
        const newAchievements: string[] = [];

        // Streak achievements
        if (currentStreak >= 5 && !unlockedAchievements.includes('streak_5')) newAchievements.push('streak_5');
        if (currentStreak >= 15 && !unlockedAchievements.includes('streak_15')) newAchievements.push('streak_15');
        if (currentStreak >= 30 && !unlockedAchievements.includes('streak_30')) newAchievements.push('streak_30');

        // Quiz completion achievements
        const totalPracticeQuizzes = (quizCompletions.verbal || 0) + (quizCompletions.quantitative || 0) + (quizCompletions['non-verbal'] || 0) + (quizCompletions.smart || 0) + (quizCompletions.creative || 0);
        if (quizCompletions.verbal >= 10 && !unlockedAchievements.includes('verbal_10')) newAchievements.push('verbal_10');
        if (quizCompletions.quantitative >= 10 && !unlockedAchievements.includes('quant_10')) newAchievements.push('quant_10');
        if (quizCompletions['non-verbal'] >= 10 && !unlockedAchievements.includes('nonverbal_10')) newAchievements.push('nonverbal_10');
        if ((quizCompletions.smart || 0) >= 1 && !unlockedAchievements.includes('smart_learner')) newAchievements.push('smart_learner');
        if (totalPracticeQuizzes >= 25 && !unlockedAchievements.includes('practice_25')) newAchievements.push('practice_25');

        // Performance achievements
        if ((perfectScores || 0) >= 5 && !unlockedAchievements.includes('quiz_whiz')) newAchievements.push('quiz_whiz');
        if ((totalCorrectAnswers || 0) >= 100 && !unlockedAchievements.includes('brainiac_100')) newAchievements.push('brainiac_100');

        if (newAchievements.length > 0) {
            addAchievements(newAchievements);
            const achievementDetails = ACHIEVEMENTS.filter(ach => newAchievements.includes(ach.id));
            setShowcasedAchievements(prev => [...prev, ...achievementDetails]);
        }
    };
    checkAndUnlockAchievements();
  }, [userData, addAchievements]);


  const handleStartQuiz = useCallback(async (category: Category) => {
    if (category.id === 'creative') {
        setIsCreativeLoading(true);
        try {
            const prompt = await generateCreativePrompt(userData.grade!);
            setCreativeQuestion(prompt);
            setGameState(GameState.CreativeQuiz);
        } catch (error) {
            setError("Could not start a creative challenge. Please try again.");
        } finally {
            setIsCreativeLoading(false);
        }
        return;
    }

    if (!allQuestions || category.id === 'daily' || category.id === 'smart') return;

    const questionPool = allQuestions[category.id as 'verbal' | 'quantitative' | 'non-verbal'] || [];
    const shuffled = shuffleArray(questionPool);
    const quizQuestions = shuffled.slice(0, TOTAL_QUESTIONS_PER_QUIZ);
    
    setCurrentCategory(category);
    setQuestions(quizQuestions);
    setUserAnswers([]);
    setGameState(GameState.Quiz);
  }, [allQuestions, userData.grade]);

  const handleStartDailyPuzzle = useCallback(() => {
    if (!allQuestions) return;

    const combinedPool = [...allQuestions.verbal, ...allQuestions.quantitative, ...allQuestions['non-verbal']];
    if(combinedPool.length === 0) return;
    
    const dayOfYear = getDayOfYear();
    const puzzleIndex = dayOfYear % combinedPool.length;
    const puzzle = combinedPool[puzzleIndex];

    const dailyCategory: Category = { id: 'daily', name: 'Daily Puzzle', description: '', icon: <></> };
    setCurrentCategory(dailyCategory);
    setQuestions([puzzle]);
    setUserAnswers([]);
    setGameState(GameState.Quiz);
  }, [allQuestions]);

  const handleStartSmartPracticeQuiz = useCallback(() => {
    if (!allQuestions) return;

    const allPracticeQuestions = [...allQuestions.verbal, ...allQuestions.quantitative, ...allQuestions['non-verbal']];
    const weakSubCategories = Object.entries(userData.performance)
      .filter(([, stats]) => stats.total >= 3)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .slice(0, 3).map(item => item[0]);
  
    let quizQuestions: Question[] = [];
  
    if (weakSubCategories.length > 0) {
      const weakQuestions = shuffleArray(allPracticeQuestions.filter(q => weakSubCategories.includes(q.subCategory))).slice(0, 3);
      quizQuestions.push(...weakQuestions);
    }
  
    const remainingSlots = TOTAL_QUESTIONS_PER_QUIZ - quizQuestions.length;
    const randomQuestions = shuffleArray(allPracticeQuestions.filter(q => !quizQuestions.some(qq => qq.question === q.question))).slice(0, remainingSlots);
    quizQuestions.push(...randomQuestions);

    if (quizQuestions.length < TOTAL_QUESTIONS_PER_QUIZ) {
        quizQuestions = shuffleArray(allPracticeQuestions).slice(0, TOTAL_QUESTIONS_PER_QUIZ);
    }
  
    const smartCategory: Category = { id: 'smart', name: 'Smart Practice', description: '', icon: <></> };
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

    if (isPracticeQuiz) {
        addCorrectAnswers(score);
        const performanceUpdates = userAnswers.map(answer => ({
            subCategory: questions[answer.questionIndex].subCategory,
            isCorrect: answer.isCorrect,
        }));
        updatePerformance(performanceUpdates);
    }
    
    if (isDailyPuzzle && userAnswers[0]?.isCorrect) {
      completeDailyPuzzle();
      if(!userData.unlockedAchievements.includes('daily_puzzle')) {
          newAchievements.push('daily_puzzle');
      }
    }
    
    if (isPracticeQuiz) {
      const categoryId = currentCategory?.id;
      if (categoryId && (categoryId === 'verbal' || categoryId === 'quantitative' || categoryId === 'non-verbal' || categoryId === 'smart' || categoryId === 'creative')) {
          addQuizCompletion(categoryId);
      }
      const totalQuizzes = Object.values(userData.quizCompletions).reduce((a, b) => a + b, 0);
      if (totalQuizzes === 0 && !userData.unlockedAchievements.includes('first_quiz')) {
        newAchievements.push('first_quiz');
      }
      if (score === TOTAL_QUESTIONS_PER_QUIZ) {
        incrementPerfectScores();
        if (!userData.unlockedAchievements.includes('perfect_score')) {
          newAchievements.push('perfect_score');
        }
      }
    }

    if (newAchievements.length > 0) {
        addAchievements(newAchievements);
        const achievementDetails = ACHIEVEMENTS.filter(ach => newAchievements.includes(ach.id));
        setShowcasedAchievements(achievementDetails);
    }
    
    if (isDailyPuzzle) {
        handlePlayAgain();
    } else {
        setGameState(GameState.Results);
    }
  };

  const handleCreativeQuizSubmit = async (answer: string) => {
    if (!creativeQuestion) return;
    setIsCreativeLoading(true);
    try {
        const feedback = await evaluateCreativeAnswer(creativeQuestion.prompt, answer, userData.grade!);
        setCreativeResult({ prompt: creativeQuestion.prompt, answer, feedback });
        addQuizCompletion('creative');
        setGameState(GameState.CreativeResult);
    } catch (error) {
        setError("Could not get feedback for your answer. Please try again.");
        setGameState(GameState.Home); // Go home on error
    } finally {
        setIsCreativeLoading(false);
        setCreativeQuestion(null);
    }
  };

  const handlePlayAgain = () => {
    setGameState(GameState.Home);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentCategory(null);
    setCreativeResult(null);
  };
  
  const handleStartTutorChat = (question: Question, userAnswer: UserAnswer) => {
    setTutorContext({ question, userAnswer });
    setGameState(GameState.TutorChat);
  };

  const handleGradeSelect = (grade: number) => {
    setGrade(grade);
    setGameState(GameState.Home);
  };

  const renderContent = () => {
    if (gameState === GameState.GradeSelection) {
      return <GradeSelectionScreen onGradeSelect={handleGradeSelect} />;
    }
    
    if (isLoading || isCreativeLoading) {
      return <LoadingSpinner message={isCreativeLoading ? "Sparking creativity..." : "Preparing questions..."} />;
    }
    
    switch (gameState) {
      case GameState.TutorChat:
        return tutorContext && userData.grade ? (
          <TutorChatScreen
            questionContext={tutorContext}
            grade={userData.grade}
            onBack={() => setGameState(GameState.Results)}
          />
        ) : <LoadingSpinner message="Loading tutor..."/>;
      case GameState.CreativeQuiz:
        return creativeQuestion ? (
          <CreativeQuizScreen
            prompt={creativeQuestion.prompt}
            onSubmit={handleCreativeQuizSubmit}
          />
        ) : <LoadingSpinner message="Loading creative challenge..."/>;
      case GameState.CreativeResult:
        return creativeResult && <CreativeResultScreen result={creativeResult} onPlayAgain={handlePlayAgain} />;
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
            onAskTutor={handleStartTutorChat}
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
            onStartQuiz={handleStartQuiz} 
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