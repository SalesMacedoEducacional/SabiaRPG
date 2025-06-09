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
      
      // Buscar escolas reais vinculadas ao gestor
      const { data: escolasVinculadas, error: errorVinculadas } = await supabase
        .from('escolas')
        .select(`
          id,
          nome,
          codigo_escola,
          tipo,
          modalidade_ensino,
          cidade,
          estado,
          zona_geografica,
          endereco_completo,
          telefone,
          email_institucional,
          criado_em
        `)
        .eq('gestor_id', req.session?.userId)
        .order('nome');
      
      if (errorVinculadas) {
        console.error("Erro ao buscar escolas do gestor:", errorVinculadas.message);
        return res.status(500).json({ 
          message: "Erro ao buscar escolas vinculadas", 
          error: errorVinculadas.message 
        });
      }
      
      console.log(`Encontradas ${escolasVinculadas?.length || 0} escolas vinculadas ao gestor`);
      return res.status(200).json(escolasVinculadas || []);
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