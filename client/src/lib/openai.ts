import { apiRequest } from './queryClient';
import OpenAI from 'openai';

export interface FeedbackRequest {
  progress: {
    id?: number;
    score?: number;
    attempts?: number;
  };
  missionContent: {
    title: string;
    description: string;
    area: string;
  };
  userAnswers: any;
}

export interface FeedbackResponse {
  feedback: string;
}

// Initialize OpenAI client (this client is for frontend use only in development)
// For production, all OpenAI calls should be routed through the backend API
// to protect the API key
// Use server-side API route for production
// const openai = new OpenAI({ apiKey: 'use-server-side-api-instead' });

export const generateFeedback = async (
  feedbackRequest: FeedbackRequest
): Promise<string> => {
  try {
    const response = await apiRequest(
      'POST', 
      '/api/generate-feedback', 
      feedbackRequest
    );
    
    const data: FeedbackResponse = await response.json();
    return data.feedback;
  } catch (error) {
    console.error('Error generating feedback:', error);
    return "Não foi possível gerar um feedback neste momento. Por favor, tente novamente mais tarde.";
  }
};

// Function to generate personalized lesson recommendations based on student performance
export const generatePersonalizedRecommendations = async (
  userData: {
    username: string;
    completedMissions: any[];
    strengths: string[];
    areas_for_improvement: string[];
  }
): Promise<string[]> => {
  try {
    // Using server-side API for OpenAI calls
    const response = await apiRequest(
      'POST',
      '/api/generate-recommendations',
      userData
    );
    
    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      "Recomendamos revisar o material básico para fortalecer sua compreensão.",
      "Continue praticando exercícios para melhorar seu desempenho."
    ];
  }
};

export const generateDiagnosticRecommendation = async (
  diagnosticResults: {
    area: string;
    score: number;
    answers: any[];
    studentName?: string;
  }
): Promise<string> => {
  try {
    // Use the server-side API to generate recommendations with OpenAI
    const response = await apiRequest(
      'POST',
      '/api/generate-diagnostic-recommendation',
      diagnosticResults
    );
    
    const data = await response.json();
    return data.recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    
    // Fallback response if API call fails
    const baseResponse = `Baseado em suas respostas para ${diagnosticResults.area}, 
                          recomendamos começar com `;
    
    if (diagnosticResults.score < 30) {
      return `${baseResponse} as trilhas introdutórias para fortalecer sua base de conhecimento.`;
    } else if (diagnosticResults.score < 70) {
      return `${baseResponse} as trilhas intermediárias, com foco em solidificar os conceitos principais.`;
    } else {
      return `${baseResponse} as trilhas avançadas, com desafios que expandirão ainda mais seu conhecimento.`;
    }
  }
};
