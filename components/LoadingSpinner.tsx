import React from 'react';

interface LoadingSpinnerProps {
    message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center" role="status" aria-live="polite">
      <div className="w-16 h-16 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-6 text-2xl font-semibold text-blue-700">{message}</p>
    </div>
  );
};

export default LoadingSpinner;