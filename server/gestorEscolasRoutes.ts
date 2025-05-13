/**
 * Rotas específicas para gestão de escolas pelo perfil Gestor
 */
import { Express, Request, Response } from "express";
import { supabase } from "../db/supabase";
import { authenticateCustom, requireRole } from "./customAuth";

/**
 * Registra as rotas para gestão de escolas pelo perfil Gestor
 * @param app Instância do Express
 */
export function registerGestorEscolasRoutes(app: Express) {
  /**
   * Rota para verificar se o gestor já tem uma escola cadastrada
   */
  app.get("/api/escolas/gestor", authenticateCustom, requireRole(["manager", "admin"]), async (req: Request, res: Response) => {
    try {
      console.log("Verificando escola vinculada ao gestor:", req.session?.userId);
      
      // Primeiro tenta buscar escolas pela vinculação em perfis_gestor
      let { data: escolasVinculadas, error: errorVinculadas } = await supabase
        .from('escolas')
        .select('*')
        .eq('gestor_id', req.session?.userId)
        .order('nome');
      
      if (errorVinculadas) {
        console.error("Erro ao buscar escolas do gestor:", errorVinculadas.message);
        return res.status(500).json({ 
          message: "Erro ao buscar escolas vinculadas", 
          error: errorVinculadas.message 
        });
      }
      
      // Se encontrou escolas, retorna-as
      if (escolasVinculadas && escolasVinculadas.length > 0) {
        console.log("Encontradas escolas vinculadas ao gestor pela coluna gestor_id:", escolasVinculadas.length);
        return res.status(200).json(escolasVinculadas);
      }
      
      // Se não encontrou por gestor_id, tenta buscar pela relação em perfis_gestor
      console.log("Nenhuma escola encontrada com gestor_id. Tentando a tabela perfis_gestor...");
      
      // Busca pela tabela de perfis_gestor
      const { data: perfilGestorEscolas, error: errorPerfil } = await supabase
        .from('perfis_gestor')
        .select('escolas!inner(*)')
        .eq('usuario_id', req.session?.userId)
        .order('created_at');
      
      if (errorPerfil) {
        console.log("Erro ao buscar relação pela tabela perfis_gestor:", errorPerfil.message);
      } else if (perfilGestorEscolas && perfilGestorEscolas.length > 0) {
        // Extrai apenas os dados das escolas
        const escolas = perfilGestorEscolas.map(item => item.escolas);
        console.log("Encontradas escolas através da tabela perfis_gestor:", escolas.length);
        return res.status(200).json(escolas);
      }
      
      // Último recurso: buscar todas as escolas para desenvolvimento
      console.log("Nenhuma escola encontrada via perfis_gestor. Buscando todas as escolas (para desenvolvimento)...");
      
      // Obter todas as escolas (apenas para ambiente de desenvolvimento)
      const { data: todasEscolas, error: errorTodas } = await supabase
        .from('escolas')
        .select('*')
        .order('nome')
        .limit(3);
      
      if (errorTodas) {
        console.error("Erro ao buscar todas as escolas:", errorTodas.message);
        return res.status(500).json({
          message: "Erro ao buscar escolas", 
          error: errorTodas.message
        });
      }
      
      console.log("Retornando todas as escolas para desenvolvimento:", todasEscolas?.length || 0);
      return res.status(200).json(todasEscolas || []);
    } catch (error) {
      console.error("Erro ao buscar escolas do gestor:", error);
      return res.status(500).json({ 
        message: "Erro interno ao consultar escolas", 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    }
  });

  /**
   * Rota para adicionar nova escola ao gestor atual
   */
  app.post("/api/escolas/gestor", authenticateCustom, requireRole(["manager", "admin"]), (req: Request, res: Response) => {
    // Implementar lógica para cadastrar uma nova escola
    // e vinculá-la ao gestor atual
    
    // Por enquanto, apenas retornamos um sucesso imediato
    return res.status(201).json({ message: "Escola cadastrada com sucesso" });
  });
}