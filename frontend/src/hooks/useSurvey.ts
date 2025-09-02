import { useContext } from 'react';
import { SurveyContext } from '../contexts/SurveyContextOnly';

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) throw new Error('useSurvey must be used within SurveyProvider');
  return context;
};
