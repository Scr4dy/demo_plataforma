

export interface EvaluationResponse { id: number; titulo: string; descripcion?: string; estado?: string }
export interface EvaluationAttempt { id: number; evaluationId?: number }
export type AnswerResponse = any
export type EvaluationResult = any
export type QuestionResponse = any

export const evaluationService = {
  getUserEvaluations: async (): Promise<EvaluationResponse[]> => [],
  getEvaluationById: async (_id: number): Promise<EvaluationResponse | null> => null,
  startEvaluationAttempt: async (_id: number): Promise<EvaluationAttempt | null> => null,
  submitEvaluation: async (_payload: any): Promise<any | null> => null,
  getPendingEvaluations: async (): Promise<EvaluationResponse[]> => [],
  getEvaluationStats: async (): Promise<any> => ({ totalEvaluaciones: 0, evaluacionesCompletadas: 0, evaluacionesPendientes: 0, tasaAprobacion: 0, puntuacionPromedio: 0, proximasEvaluaciones: 0 }),
};

export default evaluationService;

