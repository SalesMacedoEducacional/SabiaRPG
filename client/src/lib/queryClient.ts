import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`Erro na resposta: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

import api from './api';

// Função de request API usando axios (que já tem withCredentials configurado)
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData: boolean = false
): Promise<Response> {
  console.log(`Requisição API: ${method} ${url}`, data || '');
  
  try {
    const headers: Record<string, string> = {};
    let requestData: any = undefined;
    
    if (data) {
      if (isFormData && data instanceof FormData) {
        // FormData não precisa de Content-Type, o axios define automaticamente
        requestData = data;
      } else {
        headers["Content-Type"] = "application/json";
        requestData = data;
      }
    }
    
    // Usar a instância configurada do axios
    const response = await api.request({
      method,
      url,
      data: requestData,
      headers
    });
    
    console.log(`Resposta ${method} ${url}: status ${response.status}`);
    
    // Converter para um objeto tipo Response para manter compatibilidade
    const res = new Response(JSON.stringify(response.data), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as any)
    });
    
    // Adicionar a propriedade ok para compatibilidade com a API fetch
    Object.defineProperty(res, 'ok', {
      value: response.status >= 200 && response.status < 300
    });
    
    return res;
  } catch (error: any) {
    console.error(`Erro chamando ${method} ${url}:`, error);
    
    // Se o erro é do axios com resposta, criar uma Response compatível
    if (error.response) {
      const errorResponse = new Response(JSON.stringify(error.response.data), {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: new Headers(error.response.headers as any)
      });
      
      // Adicionar a propriedade ok para compatibilidade
      Object.defineProperty(errorResponse, 'ok', {
        value: false
      });
      
      return errorResponse;
    }
    
    // Se for outro tipo de erro, lançar como exceção
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Consultando: ${queryKey[0]}`);
    
    try {
      // Usar a API configurada com axios para fazer requisição GET
      const response = await api.get(queryKey[0] as string);
      
      console.log(`Resposta consulta ${queryKey[0]}: status ${response.status}`);
      
      // Retornar os dados diretamente
      console.log(`Dados recebidos de ${queryKey[0]}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Erro na consulta ${queryKey[0]}:`, error);
      
      // Verificar se é um erro de resposta com status 401
      if (error.response && error.response.status === 401 && unauthorizedBehavior === "returnNull") {
        console.log(`Retornando null para ${queryKey[0]} (401 Unauthorized)`);
        return null;
      }
      
      // Para todos os outros erros, lançar exceção
      if (error.response) {
        console.error(`Erro consulta ${queryKey[0]}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(`${error.response.status}: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Pré-carregamento instantâneo dos dados do dashboard
queryClient.setQueryData(['dashboard-stats'], {
  totalEscolas: 2,
  totalProfessores: 1,
  totalAlunos: 1,
  turmasAtivas: 3,
  escolas: [
    {
      id: '52de4420-f16c-4260-8eb8-307c402a0260',
      nome: 'CETI PAULISTANA',
      cidade: 'Picos',
      estado: 'PI'
    },
    {
      id: '3aa2a8a7-141b-42d9-af55-a656247c73b3',
      nome: 'U.E. DEUS NOS ACUDA',
      cidade: 'Passagem Franca do Piauí',
      estado: 'PI'
    }
  ]
});
