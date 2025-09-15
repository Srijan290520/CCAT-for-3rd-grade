
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Question, UserAnswer, ChatMessage } from '../types';
import { getGradeText } from '../constants';
import Mascot from './Mascot';

interface TutorChatScreenProps {
  questionContext: {
    question: Question;
    userAnswer: UserAnswer;
  };
  grade: number;
  onBack: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const TutorChatScreen: React.FC<TutorChatScreenProps> = ({ questionContext, grade, onBack }) => {
  const { question, userAnswer } = questionContext;
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gradeText = getGradeText(grade);
    const userAnswerText = question.options[userAnswer.answerIndex];
    const correctAnswerText = question.options[question.correctAnswerIndex];

    const systemInstruction = `You are a friendly, patient AI tutor called Sparky. You are helping a ${gradeText} student understand a question they got wrong.
The question was: "${question.question}".
Their answer was: "${userAnswerText}".
The correct answer was: "${correctAnswerText}".
The provided explanation is: "${question.explanation}".
Your first message should be to greet the student and ask them what they found confusing. Keep your answers simple and break down concepts step-by-step. Use emojis to be encouraging.`;
    
    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
    });
    setChat(chatSession);

    // Automatically send an empty message to get the initial greeting
    const startChat = async () => {
        setIsLoading(true);
        const response = await chatSession.sendMessageStream({ message: "" });
        let text = '';
        for await (const chunk of response) {
            text += chunk.text;
            setHistory([{ role: 'model', text }]);
        }
        setIsLoading(false);
    };
    startChat();

  }, [question, userAnswer, grade]);

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !chat || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', text: currentMessage };
    setHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
        const response = await chat.sendMessageStream({ message: currentMessage });
        let text = '';
        const modelMessageIndex = history.length + 1;

        for await (const chunk of response) {
            text += chunk.text;
            setHistory(prev => {
                const newHistory = [...prev];
                if (newHistory[modelMessageIndex] && newHistory[modelMessageIndex].role === 'model') {
                    newHistory[modelMessageIndex].text = text;
                } else {
                    newHistory.push({ role: 'model', text });
                }
                return newHistory;
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setHistory(prev => [...prev, { role: 'model', text: 'Oops! I had a little trouble thinking. Can you ask me that again?' }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-2xl animate-fade-in-up flex flex-col h-[80vh]">
        <div className="flex items-center justify-between mb-4 border-b pb-4">
            <button onClick={onBack} className="text-blue-600 font-bold text-lg hover:underline">&larr; Back to Results</button>
            <h1 className="text-2xl font-extrabold text-blue-600">Ask Sparky the Tutor</h1>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="font-bold text-gray-700">Question:</p>
            <p className="text-gray-600">{question.question}</p>
        </div>

        <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {history.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.role === 'model' && <div className="w-10 h-10 flex-shrink-0"><Mascot status="thinking" /></div> }
                   <div className={`max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                   </div>
                </div>
            ))}
            {isLoading && history[history.length-1]?.role === 'user' && (
                 <div className="flex items-end gap-2 justify-start">
                    <div className="w-10 h-10 flex-shrink-0"><Mascot status="thinking" /></div>
                    <div className="max-w-md p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                 </div>
            )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question..."
                className="flex-grow p-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !currentMessage.trim()} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                Send
            </button>
        </form>
    </div>
  );
};

export default TutorChatScreen;
