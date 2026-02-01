
export type CriteriaStatus = 'completed' | 'pending';
export type EvaluationStatus = 'draft' | 'in-progress' | 'completed';

export interface SelectedCriteria {
  [key: string]: string;
}

export interface CriteriaItem {
  id: string;
  title: string;
  icon: string;
  status: CriteriaStatus;
  options?: string[];
}

export interface EvaluatedPerson {
  name: string;
  test: string;
  date: string;
  evaluator: string;
}

export interface EvaluationData {
  evaluated: EvaluatedPerson;
  criteria: CriteriaItem[];
  observationTips: string[];
  status: EvaluationStatus;
}

export interface EvaluationActions {
  onRadioSelect: (criteriaId: string, value: string) => void;
  onFinalize: () => void;
  onSave: () => void;
  onPrint: () => void;
  onObservationsChange: (text: string) => void;
}

export interface EvaluationUIHelpers {
  getStatusColor: (status: string) => string;
  getRadioStyle: (criteriaId: string, value: string, selectedCriteria: SelectedCriteria) => any[];
  getRadioTextStyle: (criteriaId: string, value: string, selectedCriteria: SelectedCriteria) => any[];
}