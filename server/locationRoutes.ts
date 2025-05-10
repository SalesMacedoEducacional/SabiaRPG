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
      // Buscar todos os estados ordenados por nome
      const { data: estados, error } = await supabase
        .from('estados')
        .select('id, sigla, nome')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar estados:', error);
        return res.status(500).json({ message: 'Erro ao buscar estados', error: error.message });
      }
      
      return res.status(200).json(estados);
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
        const { data: estado, error: estadoError } = await supabase
          .from('estados')
          .select('id')
          .eq('sigla', estado_id.toUpperCase())
          .single();
        
        if (estadoError || !estado) {
          return res.status(404).json({ message: 'Estado não encontrado' });
        }
        
        estadoId = estado.id;
      } else {
        // É um ID numérico
        estadoId = parseInt(estado_id);
        if (isNaN(estadoId)) {
          return res.status(400).json({ message: 'ID de estado inválido' });
        }
      }
      
      // Buscar cidades do estado ordenadas por nome
      const { data: cidades, error } = await supabase
        .from('cidades')
        .select('id, nome')
        .eq('estado_id', estadoId)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar cidades:', error);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: error.message });
      }
      
      return res.status(200).json(cidades);
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
      const { data: estado, error: estadoError } = await supabase
        .from('estados')
        .select('id')
        .eq('sigla', sigla.toUpperCase())
        .single();
      
      if (estadoError || !estado) {
        return res.status(404).json({ message: 'Estado não encontrado' });
      }
      
      // Buscar cidades do estado
      const { data: cidades, error } = await supabase
        .from('cidades')
        .select('id, nome')
        .eq('estado_id', estado.id)
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar cidades:', error);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: error.message });
      }
      
      return res.status(200).json(cidades);
    } catch (error) {
      console.error('Erro ao processar requisição de cidades por sigla:', error);
      return res.status(500).json({ message: 'Erro interno ao processar cidades' });
    }
  });
}