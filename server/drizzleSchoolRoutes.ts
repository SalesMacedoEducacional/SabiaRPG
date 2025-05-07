import { Express, Request, Response } from 'express';
import { z } from 'zod';
import './types'; // Importa as extensões de tipo para express-session
import { db } from './db';
import { escolas, perfilGestor, insertPerfilGestorSchema } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Schema para validação dos dados da escola
const schoolSchema = z.object({
  nome: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres"),
  codigo_escola: z.string().optional(),
  tipo: z.enum(["estadual", "municipal", "particular", "federal"], {
    required_error: "Selecione o tipo de escola",
  }),
  modalidade_ensino: z.string().min(2, "Informe a modalidade de ensino"),
  cidade: z.string().min(2, "Informe a cidade"),
  estado: z.string({
    required_error: "Selecione o estado",
  }),
  zona_geografica: z.enum(["urbana", "rural"], {
    required_error: "Selecione a zona geográfica",
  }),
  endereco_completo: z.string().min(5, "Informe o endereço completo"),
  telefone: z.string().min(14, "Formato de telefone inválido").max(15, "Formato de telefone inválido"),
  email_institucional: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

/**
 * Registra as rotas relacionadas às escolas utilizando Drizzle ORM
 * @param app Express application
 * @param authenticate Middleware de autenticação
 * @param requireRole Middleware de verificação de papel
 */
export function registerDrizzleSchoolRoutes(
  app: Express, 
  authenticate: (req: Request, res: Response, next: Function) => void,
  requireRole: (roles: string[]) => (req: Request, res: Response, next: Function) => Promise<void>
) {
  /**
   * Rota para verificar se o gestor tem uma escola vinculada ao seu perfil
   * Acessível apenas para gestores
   */
  app.get(
    '/api/pg/schools/check-manager-school',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        // Obter ID do usuário da sessão
        const userId = req.session?.userId;
        
        if (!userId) {
          return res.status(401).json({ message: 'Não autorizado' });
        }
        
        console.log('Verificando escola vinculada ao gestor (Drizzle):', userId);
      
        // Verificar se há informações de escola na sessão
        if (req.session?.escola_id) {
          console.log(`Escola encontrada na sessão do servidor: ${req.session.escola_id}`);
          
          // Buscar informações da escola no banco usando Drizzle
          const escolaResult = await db.select().from(escolas)
            .where(eq(escolas.id, req.session.escola_id))
            .limit(1);
            
          if (escolaResult && escolaResult.length > 0) {
            return res.status(200).json({
              hasSchool: true,
              school: escolaResult[0]
            });
          }
        }
        
        // Verificar relação gestor-escola no banco via tabela perfis_gestor
        const perfilResult = await db.select()
        .from(perfilGestor)
        .where(eq(perfilGestor.usuarioId, String(userId)))
        .limit(1);
        
        if (perfilResult && perfilResult.length > 0) {
          // Buscar escola relacionada usando o escolaId
          const escolaId = perfilResult[0].escolaId;
          
          if (escolaId) {
            const escolaData = await db.select()
              .from(escolas)
              .where(eq(escolas.id, escolaId))
              .limit(1);
              
            if (escolaData && escolaData.length > 0) {
              console.log(`Escola encontrada via perfil_gestor para gestor ${userId}:`, escolaData[0].id);
              
              // Atualizar a sessão com o ID da escola
              if (req.session) {
                req.session.escola_id = escolaData[0].id;
              }
              
              // Retornar os dados da escola
              return res.status(200).json({
                hasSchool: true,
                school: escolaData[0]
              });
            }
          }
        }
        
        // Nenhuma escola encontrada
        console.log('Nenhuma escola encontrada para o gestor');
        return res.status(404).json({ message: 'School not found', hasSchool: false });
      } catch (error) {
        console.error('Erro ao verificar escola do gestor:', error);
        return res.status(500).json({ message: 'Erro ao verificar escola' });
      }
    }
  );

  /**
   * Rota para cadastrar uma nova escola
   * Acessível apenas para administradores e gestores
   */
  app.post(
    '/api/pg/schools',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        // Validar os dados de entrada
        const validationResult = schoolSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: 'Dados inválidos', 
            errors: validationResult.error.format() 
          });
        }
        
        const schoolData = validationResult.data;
        
        // Garantir que se o usuário for gestor, o gestor_id será o seu próprio ID
        if (req.session.userRole === 'manager') {
          const userId = req.session.userId;
          
          console.log(`Registrando escola para gestor ID: ${userId}`);
          
          try {
            // Inserir escola no banco usando Drizzle ORM
            const escolaInsert = {
              nome: schoolData.nome,
              codigoEscola: schoolData.codigo_escola || '',
              endereco: schoolData.endereco_completo || null,
              telefone: schoolData.telefone || null,
            };
            
            console.log('Inserindo escola com dados:', escolaInsert);
            
            // Salvar a escola no banco de dados usando Drizzle ORM
            const insertedSchools = await db.insert(escolas).values(escolaInsert).returning();
            
            if (!insertedSchools || insertedSchools.length === 0) {
              console.error('Escola inserida, mas não retornada');
              return res.status(500).json({ 
                message: 'Falha ao obter dados da escola cadastrada'
              });
            }
            
            const insertedSchool = insertedSchools[0];
            
            // Escola salva com sucesso
            const schoolId = insertedSchool.id;
            console.log(`Escola cadastrada com sucesso. ID: ${schoolId}`);
            
            // Criar vínculo na tabela perfis_gestor
            try {
              const perfilResult = await db.insert(perfilGestor).values({
                usuarioId: String(userId),
                escolaId: schoolId,
                cargo: 'Gestor Escolar',
                permissoesEspeciais: {},
                ativo: true
              }).returning();
              
              if (perfilResult && perfilResult.length > 0) {
                console.log('Perfil de gestor criado com sucesso. ID:', perfilResult[0].id);
              } else {
                console.error('Perfil de gestor não retornado após inserção');
              }
            } catch (perfilError) {
              console.error('Erro ao criar perfil do gestor:', perfilError);
              // Continuar mesmo com erro no perfil, pois a escola já foi criada
            }
            
            // Adicionar ID da escola à sessão do usuário
            req.session.escola_id = schoolId;
            console.log(`Escola ID ${schoolId} vinculada ao gestor na sessão`);
            
            // Recuperar a escola recém-criada para garantir todos os campos
            const escolaCompleta = await db.select().from(escolas)
              .where(eq(escolas.id, schoolId))
              .limit(1);
              
            // Adicionar campos extras para compatibilidade com o cliente
            const escolaResponse = {
              ...escolaCompleta[0],
              teachers: 0,
              students: 0,
              active: true, 
              createdAt: new Date().toISOString()
            };
            
            // Retornar os dados completos da escola inserida
            return res.status(201).json(escolaResponse);
            
          } catch (dbError) {
            console.error('Erro ao interagir com o banco de dados:', dbError);
            return res.status(500).json({
              message: 'Erro ao cadastrar escola no banco de dados',
              details: dbError.message || 'Erro desconhecido'
            });
          }
        }
        
        // Para administradores
        if (req.session.userRole === 'admin') {
          // TODO: Implementar criação de escola por administrador
          return res.status(501).json({ message: 'Criação de escola por administrador ainda não implementada' });
        }
        
        // Para perfis não autorizados
        return res.status(403).json({ message: 'Perfil não autorizado a criar escolas' });
      } catch (error) {
        console.error('Erro ao cadastrar nova escola:', error);
        return res.status(500).json({ 
          message: 'Erro ao cadastrar nova escola',
          details: error.message || 'Erro desconhecido'
        });
      }
    }
  );
}