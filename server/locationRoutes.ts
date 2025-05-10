import { Express, Request, Response } from 'express';
import { db } from './db';
import { supabase } from '../db/supabase';

/**
 * Registra as rotas de localização (estados e cidades)
 * @param app Aplicação Express
 */
export function registerLocationRoutes(app: Express) {

  /**
   * Rota para listar todos os estados em ordem alfabética
   */
  app.get('/api/estados', async (req: Request, res: Response) => {
    try {
      // Usar SQL direto para buscar os estados
      const query = 'SELECT id, sigla, nome FROM estados ORDER BY nome';
      const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
      
      if (error) {
        console.error('Erro ao buscar estados:', error);
        return res.status(500).json({ message: 'Erro ao buscar estados', error: error.message });
      }
      
      // Execute_sql retorna um array com um único item que contém os resultados
      if (data && Array.isArray(data) && data.length > 0) {
        return res.status(200).json(data[0]);
      } else {
        console.error('Formato de resposta inesperado:', data);
        return res.status(500).json({ message: 'Formato de resposta inesperado' });
      }
    } catch (error) {
      console.error('Erro ao processar requisição de estados:', error);
      return res.status(500).json({ message: 'Erro interno ao processar estados' });
    }
  });
  
  /**
   * Rota para listar todas as cidades de um estado específico
   */
  app.get('/api/estados/:estado_id/cidades', async (req: Request, res: Response) => {
    const { estado_id } = req.params;
    
    try {
      // Verificar se o parâmetro é uma sigla (2 caracteres) ou um ID numérico
      let estadoId: number;
      
      if (estado_id.length === 2) {
        // É uma sigla, precisamos buscar o ID correspondente
        const estadoQuery = `SELECT id FROM estados WHERE sigla = '${estado_id.toUpperCase()}'`;
        const { data: estadoData, error: estadoError } = await supabase.rpc('execute_sql', { sql_query: estadoQuery });
        
        if (estadoError || !estadoData || !Array.isArray(estadoData) || !estadoData[0] || estadoData[0].length === 0) {
          console.error('Erro ao buscar estado por sigla:', estadoError || 'Estado não encontrado');
          return res.status(404).json({ message: 'Estado não encontrado' });
        }
        
        estadoId = estadoData[0][0].id;
      } else {
        // É um ID numérico
        estadoId = parseInt(estado_id);
        if (isNaN(estadoId)) {
          return res.status(400).json({ message: 'ID de estado inválido' });
        }
      }
      
      // Buscar cidades do estado ordenadas por nome
      const cidadesQuery = `SELECT id, nome FROM cidades WHERE estado_id = ${estadoId} ORDER BY nome`;
      const { data: cidadesData, error: cidadesError } = await supabase.rpc('execute_sql', { sql_query: cidadesQuery });
      
      if (cidadesError) {
        console.error('Erro ao buscar cidades:', cidadesError);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: cidadesError.message });
      }
      
      if (!cidadesData || !Array.isArray(cidadesData) || !cidadesData[0]) {
        console.error('Formato de resposta inesperado para cidades:', cidadesData);
        return res.status(500).json({ message: 'Formato de resposta inesperado' });
      }
      
      return res.status(200).json(cidadesData[0]);
    } catch (error) {
      console.error('Erro ao processar requisição de cidades:', error);
      return res.status(500).json({ message: 'Erro interno ao processar cidades' });
    }
  });
  
  /**
   * Rota alternativa para buscar cidades por sigla do estado
   */
  app.get('/api/estados/:sigla/cidades-por-sigla', async (req: Request, res: Response) => {
    const { sigla } = req.params;
    
    if (!sigla || sigla.length !== 2) {
      return res.status(400).json({ message: 'Sigla de estado inválida' });
    }
    
    try {
      // Buscar o ID do estado pela sigla
      const estadoQuery = `SELECT id FROM estados WHERE sigla = '${sigla.toUpperCase()}'`;
      const { data: estadoData, error: estadoError } = await supabase.rpc('execute_sql', { sql_query: estadoQuery });
      
      if (estadoError || !estadoData || !Array.isArray(estadoData) || !estadoData[0] || estadoData[0].length === 0) {
        console.error('Erro ao buscar estado por sigla:', estadoError || 'Estado não encontrado');
        return res.status(404).json({ message: 'Estado não encontrado' });
      }
      
      const estadoId = estadoData[0][0].id;
      
      // Buscar cidades do estado
      const cidadesQuery = `SELECT id, nome FROM cidades WHERE estado_id = ${estadoId} ORDER BY nome`;
      const { data: cidadesData, error: cidadesError } = await supabase.rpc('execute_sql', { sql_query: cidadesQuery });
      
      if (cidadesError) {
        console.error('Erro ao buscar cidades:', cidadesError);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: cidadesError.message });
      }
      
      if (!cidadesData || !Array.isArray(cidadesData) || !cidadesData[0]) {
        console.error('Formato de resposta inesperado para cidades:', cidadesData);
        return res.status(500).json({ message: 'Formato de resposta inesperado' });
      }
      
      return res.status(200).json(cidadesData[0]);
    } catch (error) {
      console.error('Erro ao processar requisição de cidades por sigla:', error);
      return res.status(500).json({ message: 'Erro interno ao processar cidades' });
    }
  });
}