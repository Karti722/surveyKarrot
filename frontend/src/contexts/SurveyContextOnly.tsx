import { createContext } from 'react';
import type { Survey } from './SurveyContext';

export interface SurveyContextType {
  surveys: Survey[];
  loading: boolean;
  error: string | null;
  getSurveyById: (id: string) => Promise<Survey | undefined>;
  refreshSurveys: () => Promise<void>;
}

export const SurveyContext = createContext<SurveyContextType | undefined>(undefined);
