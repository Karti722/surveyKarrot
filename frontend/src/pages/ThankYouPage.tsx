import React from 'react';

const ThankYouPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
      <p className="text-lg text-gray-700">Your survey submission has been received. We appreciate your feedback!</p>
    </div>
  );
};

export default ThankYouPage;
