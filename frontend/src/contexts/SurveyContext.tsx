import React, { useState, useEffect } from 'react';
import { fetchSurveys, fetchSurveyById } from '../api';
import { SurveyContext } from './SurveyContextOnly';

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Array<{
    id: string;
    text: string;
    type: string;
    options?: string[];
  }>;
}

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurveys();
      setSurveys(data);
    } catch (e: any) {
  setError((e as Error).message || 'Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSurveys();
  }, []);

  const getSurveyById = async (id: string) => {
    try {
      return await fetchSurveyById(id);
    } catch {
      return undefined;
    }
  };

  return (
    <SurveyContext.Provider value={{ surveys, loading, error, getSurveyById, refreshSurveys }}>
      {children}
    </SurveyContext.Provider>
  );
};


