
import React, { useState } from 'react';
import Mascot from './Mascot';

interface GradeSelectionScreenProps {
    onGradeSelect: (grade: number) => void;
}

const GradeSelectionScreen: React.FC<GradeSelectionScreenProps> = ({ onGradeSelect }) => {
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    const grades = Array.from({ length: 10 }, (_, i) => i + 3); // Grades 3 through 12

    const handleSubmit = () => {
        if (selectedGrade) {
            onGradeSelect(selectedGrade);
        }
    };

    const getGradeText = (grade: number): string => {
        if (grade >= 11 && grade <= 13) {
            return `${grade}th`;
        }
        const lastDigit = grade % 10;
        switch (lastDigit) {
            case 1: return `${grade}st`;
            case 2: return `${grade}nd`;
            case 3: return `${grade}rd`;
            default: return `${grade}th`;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-2xl text-center animate-fade-in-up">
            <Mascot status="greeting" large />
            <h1 className="text-4xl font-extrabold text-blue-600 mt-6 mb-2">Welcome!</h1>
            <p className="text-xl text-gray-700 mb-8">Please select your grade to get started.</p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-10">
                {grades.map(grade => (
                    <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`p-4 rounded-lg text-2xl font-bold border-4 transition-all duration-200 ${
                            selectedGrade === grade
                                ? 'bg-yellow-400 border-yellow-500 text-white scale-110 shadow-lg'
                                : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-yellow-100 hover:border-yellow-300'
                        }`}
                    >
                        {getGradeText(grade)}
                    </button>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedGrade}
                className="bg-green-500 text-white font-bold py-4 px-12 rounded-full text-2xl hover:bg-green-600 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
                Start Learning!
            </button>
        </div>
    );
};

export default GradeSelectionScreen;
