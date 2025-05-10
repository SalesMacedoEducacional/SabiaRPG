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
      // Usar a API do Supabase diretamente - note que a estrutura da tabela tem apenas id e nome
      // sendo que o id é a sigla do estado (ex: 'AC', 'SP', etc)
      const { data: estados, error } = await supabase
        .from('estados')
        .select('id, nome')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar estados:', error);
        return res.status(500).json({ message: 'Erro ao buscar estados', error: error.message });
      }
      
      // Converter para o formato esperado pelo frontend
      const estadosFormatados = estados.map(estado => ({
        id: estado.id,
        sigla: estado.id, // a sigla é o próprio id
        nome: estado.nome
      }));
      
      return res.status(200).json(estadosFormatados);
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
      // Na estrutura atual, o id da tabela estados é a própria sigla (ex: 'AC', 'SP')
      let estadoId = estado_id;
      
      // Se o id fornecido não é uma sigla de estado de 2 caracteres, tratamos como erro
      if (estadoId.length !== 2) {
        // Verificamos se existe um estado com esse ID
        const { data: estadoExiste, error: estadoErro } = await supabase
          .from('estados')
          .select('id')
          .eq('id', estadoId.toUpperCase())
          .maybeSingle();
          
        if (estadoErro || !estadoExiste) {
          return res.status(400).json({ message: 'ID de estado inválido ou não encontrado' });
        }
      }
      
      // Converter para maiúsculo para garantir consistência
      estadoId = estadoId.toUpperCase();
      
      // Buscar cidades do estado ordenadas por nome
      const { data: cidades, error: cidadesError } = await supabase
        .from('cidades')
        .select('id, nome')
        .eq('estado_id', estadoId)
        .order('nome');
      
      if (cidadesError) {
        console.error('Erro ao buscar cidades:', cidadesError);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: cidadesError.message });
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
      // Na estrutura atual, o id da tabela estados é a própria sigla
      const estadoId = sigla.toUpperCase();
      
      // Verificar se o estado existe
      const { data: estado, error: estadoError } = await supabase
        .from('estados')
        .select('id')
        .eq('id', estadoId)
        .maybeSingle();
      
      if (estadoError || !estado) {
        console.error('Erro ao buscar estado por sigla:', estadoError || 'Estado não encontrado');
        return res.status(404).json({ message: 'Estado não encontrado' });
      }
      
      // Buscar cidades do estado
      const { data: cidades, error: cidadesError } = await supabase
        .from('cidades')
        .select('id, nome')
        .eq('estado_id', estadoId)
        .order('nome');
      
      if (cidadesError) {
        console.error('Erro ao buscar cidades:', cidadesError);
        return res.status(500).json({ message: 'Erro ao buscar cidades', error: cidadesError.message });
      }
      
      return res.status(200).json(cidades);
    } catch (error) {
      console.error('Erro ao processar requisição de cidades por sigla:', error);
      return res.status(500).json({ message: 'Erro interno ao processar cidades' });
    }
  });
}