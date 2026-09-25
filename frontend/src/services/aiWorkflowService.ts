import { MOCK_AI_WORKFLOWS, MOCK_AGENTS, MOCK_RECOMMENDATIONS } from '../mock/workflows';
import type { AIWorkflowStatus, AIAgent, AIRecommendation } from '../types/ai';

export const aiWorkflowService = {
  async getWorkflows(): Promise<AIWorkflowStatus[]> {
    return Promise.resolve(MOCK_AI_WORKFLOWS);
  },
  async getAgents(): Promise<AIAgent[]> {
    return Promise.resolve(MOCK_AGENTS);
  },
  async getRecommendations(): Promise<AIRecommendation[]> {
    return Promise.resolve(MOCK_RECOMMENDATIONS);
  },
};
