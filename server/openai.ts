import OpenAI from 'openai';

// Usar exclusivamente o modelo definido em process.env.MODEL_ID (configurado como gpt-3.5-mini)
const MODEL_ID = process.env.MODEL_ID || 'gpt-3.5-mini';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates personalized feedback for a student based on their mission performance
 * @param {Object} params - Parameters for feedback generation
 * @returns {Promise<string>} - The generated feedback
 */
export async function generateFeedback(params: {
  missionTitle: string;
  area: string;
  score: number;
  attempts: number;
  userAnswers: any;
}) {
  try {
    const { missionTitle, area, score, attempts, userAnswers } = params;
    
    // Format the prompt based on the student's performance
    const prompt = `
      Como um assistente educacional do SABIÁ RPG, você deve gerar um feedback personalizado para um estudante 
      que completou a missão "${missionTitle}" na área de "${area}".
      
      Detalhes do desempenho:
      - Pontuação: ${score}/100
      - Número de tentativas: ${attempts}
      
      Respostas do estudante: 
      ${JSON.stringify(userAnswers, null, 2)}
      
      Por favor, forneça um feedback educacional que:
      1. Comece com uma mensagem motivadora no estilo de RPG medieval
      2. Identifique os pontos fortes do estudante baseado na pontuação
      3. Sugira áreas específicas para melhoria
      4. Termine com uma mensagem de encorajamento para a próxima missão
      
      O feedback deve ser escrito em português, em tom amigável, e usar metáforas de RPG medieval.
      Limite a resposta a 300 palavras.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 
      "Não foi possível gerar um feedback neste momento. Por favor, tente novamente mais tarde.";
  } catch (error) {
    console.error("Error generating feedback with OpenAI:", error);
    return "Não foi possível gerar um feedback neste momento. Por favor, tente novamente mais tarde.";
  }
}

/**
 * Generates personalized learning path recommendations based on diagnostic results
 * @param {Object} params - Parameters for recommendation generation
 * @returns {Promise<string>} - The generated recommendation
 */
export async function generateDiagnosticRecommendation(params: {
  area: string;
  score: number;
  answers: any[];
  studentName?: string;
}) {
  try {
    const { area, score, answers, studentName } = params;
    
    const studentNameDisplay = studentName || "estudante";
    
    const prompt = `
      Como um conselheiro educacional do SABIÁ RPG, você deve analisar os resultados do diagnóstico 
      de um ${studentNameDisplay} na área de "${area}" e fornecer recomendações personalizadas.
      
      Detalhes do diagnóstico:
      - Pontuação geral: ${score}/100
      - Respostas do diagnóstico: ${JSON.stringify(answers, null, 2)}
      
      Por favor, forneça recomendações educacionais que:
      1. Começem com uma saudação personalizada no estilo RPG medieval
      2. Analisem o desempenho atual do estudante de forma construtiva
      3. Sugiram trilhas de aprendizado específicas de acordo com o nível demonstrado 
         (iniciante se score < 30, intermediário se score entre 30-70, avançado se score > 70)
      4. Recomendem 2-3 missões específicas para começar
      5. Terminem com uma mensagem de encorajamento
      
      As recomendações devem ser escritas em português, em tom amigável e motivador, 
      usando metáforas do universo RPG medieval.
      Limite a resposta a 350 palavras.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 
      "Não foi possível gerar recomendações neste momento. Por favor, tente novamente mais tarde.";
  } catch (error) {
    console.error("Error generating diagnostic recommendation with OpenAI:", error);
    
    // Fallback response if OpenAI call fails
    const baseResponse = `Baseado em sua performance na área de ${params.area}, `;
    
    if (params.score < 30) {
      return `${baseResponse}recomendamos começar com as trilhas introdutórias para fortalecer sua base de conhecimento.`;
    } else if (params.score < 70) {
      return `${baseResponse}recomendamos as trilhas intermediárias, com foco em solidificar os conceitos principais.`;
    } else {
      return `${baseResponse}recomendamos as trilhas avançadas, com desafios que expandirão ainda mais seu conhecimento.`;
    }
  }
}

/**
 * Generates personalized mission recommendations based on student's progress
 * @param {Object} params - Student progress parameters
 * @returns {Promise<string[]>} - Array of recommendation strings
 */
export async function generatePersonalizedRecommendations(params: {
  username: string;
  completedMissions: any[];
  strengths: string[];
  areas_for_improvement: string[];
}): Promise<string[]> {
  try {
    const { username, completedMissions, strengths, areas_for_improvement } = params;
    
    const prompt = `
      Como um mentor educacional do SABIÁ RPG, você deve criar recomendações personalizadas 
      para o estudante ${username} baseadas em seu histórico de aprendizado.
      
      Perfil do estudante:
      - Nome: ${username}
      - Missões completadas: ${JSON.stringify(completedMissions, null, 2)}
      - Pontos fortes: ${strengths.join(', ')}
      - Áreas para melhoria: ${areas_for_improvement.join(', ')}
      
      Por favor, forneça 3-5 recomendações personalizadas que:
      1. Sejam específicas para as áreas que precisam de melhoria
      2. Aproveitem os pontos fortes do estudante
      3. Sugiram próximas missões adequadas ao nível atual
      4. Incluam dicas práticas de estudo
      
      Formate a resposta em JSON com um array de strings, cada uma contendo uma recomendação.
      Cada recomendação deve ter no máximo 100 palavras e ser escrita em português,
      usando terminologia e metáforas do universo RPG medieval.
    `;

    const response = await openai.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }
    
    try {
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent.recommendations)) {
        return parsedContent.recommendations;
      } else {
        throw new Error("Invalid response format - recommendations not found");
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI JSON response:", parseError);
      return [
        "Continue sua jornada focando nas áreas que precisam de mais atenção.",
        "Experimente revisar conceitos básicos antes de avançar para desafios maiores.",
        "Busque missões que complementem seus pontos fortes enquanto trabalha em suas dificuldades."
      ];
    }
  } catch (error) {
    console.error("Error generating personalized recommendations with OpenAI:", error);
    return [
      "Continue sua jornada focando nas áreas que precisam de mais atenção.",
      "Experimente revisar conceitos básicos antes de avançar para desafios maiores.",
      "Busque missões que complementem seus pontos fortes enquanto trabalha em suas dificuldades."
    ];
  }
}