import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`Erro na resposta: ${res.status}: ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  isFormData: boolean = false
): Promise<Response> {
  console.log(`Requisição API: ${method} ${url}`, data || '');
  
  try {
    const headers: Record<string, string> = {};
    let body: any = undefined;
    
    if (data) {
      if (isFormData && data instanceof FormData) {
        // FormData não precisa de Content-Type, o fetch define automaticamente
        body = data;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(data);
      }
    }
    
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
    });
    
    console.log(`Resposta ${method} ${url}: status ${res.status}`);
    
    if (res.ok) {
      return res;
    }
    
    // Se não for 2xx, lança erro
    const text = (await res.text()) || res.statusText;
    console.error(`Erro API ${url}: ${res.status} - ${text}`);
    throw new Error(`${res.status}: ${text}`);
  } catch (error) {
    console.error(`Erro chamando ${method} ${url}:`, error);
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
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      console.log(`Resposta consulta ${queryKey[0]}: status ${res.status}`);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Retornando null para ${queryKey[0]} (401 Unauthorized)`);
        return null;
      }
      
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        console.error(`Erro consulta ${queryKey[0]}: ${res.status} - ${text}`);
        throw new Error(`${res.status}: ${text}`);
      }
      
      const data = await res.json();
      console.log(`Dados recebidos de ${queryKey[0]}:`, data);
      return data;
    } catch (error) {
      console.error(`Erro na consulta ${queryKey[0]}:`, error);
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
