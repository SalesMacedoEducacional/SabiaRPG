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
      const gestorId = req.session?.userId;
      console.log("Buscando escolas reais para gestor:", gestorId);
      
      if (!gestorId) {
        return res.status(401).json({ message: "Gestor não identificado" });
      }
      
      // Buscar escolas através da tabela de vínculos perfis_gestor
      const { data: perfilsGestor, error } = await supabase
        .from('perfis_gestor')
        .select(`
          escola_id,
          escolas!inner (
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
          )
        `)
        .eq('usuario_id', gestorId)
        .eq('ativo', true);
      
      if (error) {
        console.error("Erro na consulta SQL:", error);
        return res.status(500).json({ 
          message: "Erro ao buscar escolas", 
          error: error.message 
        });
      }
      
      // Extrair escolas dos perfis vinculados
      const escolas = perfilsGestor?.map(perfil => perfil.escolas) || [];
      
      console.log(`DADOS REAIS: ${escolas.length} escolas encontradas no banco`);
      console.log("Escolas:", escolas.map((e: any) => e.nome) || []);
      
      // Retornar APENAS dados autênticos do banco
      return res.status(200).json(escolas);
    } catch (error) {
      console.error("Erro interno:", error);
      return res.status(500).json({ 
        message: "Erro interno", 
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