import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../db/supabase.js';
import './types'; // Importa as extensões de tipo para express-session

// Função auxiliar para comparar valores que podem ser string ou number
function isTestUser(userId: string | number | undefined): boolean {
  if (userId === undefined) return false;
  return String(userId) === '1003';
}

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
  gestor_id: z.number().or(z.string())
});

/**
 * Registra as rotas relacionadas às escolas
 * @param app Express application
 * @param authenticate Middleware de autenticação
 * @param requireRole Middleware de verificação de papel
 */
export function registerSchoolRoutes(
  app: Express, 
  authenticate: (req: Request, res: Response, next: Function) => void,
  requireRole: (roles: string[]) => (req: Request, res: Response, next: Function) => Promise<void>
) {
  /**
   * Rota para verificar se o gestor tem uma escola vinculada ao seu perfil
   * Acessível apenas para gestores
   */
  app.get(
    '/api/schools/check-manager-school',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        // Obter ID do usuário da sessão
        const userId = req.session?.userId;
        
        if (!userId) {
          return res.status(401).json({ message: 'Não autorizado' });
        }
        
        console.log('Verificando escola vinculada ao gestor:', userId);
      
        // Primeiro tentar verificar se tem informações no sessionStorage
        // (esses dados seriam persistidos na sessão pelo frontend)
        if (req.session?.escola_id) {
          console.log(`Escola encontrada na sessão do servidor: ${req.session.escola_id}`);
          
          // Tentar recuperar informações da escola do banco, se existir
          try {
            const { data: schoolData, error: schoolError } = await supabase
              .from('escolas')
              .select('*')
              .eq('id', req.session.escola_id)
              .single();
              
            if (!schoolError && schoolData) {
              return res.status(200).json({
                hasSchool: true,
                school: schoolData
              });
            }
          } catch (dbError) {
            console.error('Erro ao buscar escola por ID da sessão:', dbError);
          }
        }
        
        // Verificar no banco de dados se o gestor possui escola
        try {
          // Primeiro, verificar na tabela perfis_gestor (modelo recomendado)
          const { data: perfilData, error: perfilError } = await supabase
            .from('perfis_gestor')
            .select('escola_id, escolas:escola_id(*)')
            .eq('usuario_id', userId)
            .order('data_vinculo', { ascending: false })
            .limit(1);
            
          if (!perfilError && perfilData && perfilData.length > 0 && perfilData[0].escolas) {
            const schoolData = perfilData[0].escolas;
            console.log(`Escola encontrada via perfil_gestor para gestor ${userId}:`, schoolData.id);
            
            // Atualizar a sessão com o ID da escola
            if (req.session) {
              req.session.escola_id = schoolData.id;
            }
            
            return res.status(200).json({
              hasSchool: true,
              school: schoolData
            });
          }
          
          // Se não encontrar na tabela perfis_gestor, verificar no campo gestor_id da tabela escolas (modelo legado)
          const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('gestor_id', userId)
            .order('criado_em', { ascending: false })
            .limit(1);
            
          if (error) {
            console.error('Erro ao consultar escola do gestor no banco:', error);
          } else if (data && data.length > 0) {
            // Escola encontrada no banco de dados
            console.log(`Escola encontrada via campo gestor_id para gestor ${userId}:`, data[0].id);
            
            // Atualizar a sessão com o ID da escola
            if (req.session) {
              req.session.escola_id = data[0].id;
            }
            
            // Criar também o vínculo na tabela perfis_gestor se não existir
            try {
              // Verificar se já existe um vínculo para evitar duplicação
              const { data: existingPerfil } = await supabase
                .from('perfis_gestor')
                .select('id')
                .eq('usuario_id', userId)
                .eq('escola_id', data[0].id)
                .maybeSingle();
                
              if (!existingPerfil) {
                const { data: newPerfil, error: perfilInsertError } = await supabase
                  .from('perfis_gestor')
                  .insert({
                    usuario_id: userId,
                    escola_id: data[0].id,
                    cargo: 'Gestor Escolar',
                    nivel_acesso: 'completo'
                  })
                  .select()
                  .single();
                  
                if (perfilInsertError) {
                  console.error('Erro ao criar vinculação na tabela perfis_gestor:', perfilInsertError);
                } else {
                  console.log('Vinculação gestor-escola criada:', newPerfil?.id);
                }
              }
            } catch (perfilError) {
              console.error('Erro ao verificar/criar perfil de gestor:', perfilError);
            }
            
            return res.status(200).json({
              hasSchool: true,
              school: data[0]
            });
          }
        } catch (error) {
          console.error('Exceção ao consultar escola do gestor:', error);
        }
        
        // Verificar se o gestor já tem alguma escola cadastrada mas não vinculada
        console.log(`Tentando buscar escolas diretamente para o gestor ${userId}`);
        
        // Tentativa final: verificar se há escolas com o gestor_id no banco
        try {
          const { data: directSchools, error: directError } = await supabase
            .from('escolas')
            .select('*')
            .eq('gestor_id', userId)
            .limit(1);
            
          if (directError) {
            console.error('Erro ao buscar escolas diretamente pelo gestor_id:', directError);
          } else if (directSchools && directSchools.length > 0) {
            console.log(`Escola encontrada diretamente pelo gestor_id: ${directSchools[0].id}`);
            
            // Atualizar a sessão
            if (req.session) {
              req.session.escola_id = directSchools[0].id;
            }
            
            // Criar vínculo na tabela perfis_gestor se não existir
            await criarVinculoGestorEscola(userId, directSchools[0].id);
            
            return res.status(200).json({
              hasSchool: true,
              school: directSchools[0]
            });
          }
        } catch (directError) {
          console.error('Erro ao buscar escolas diretamente:', directError);
        }
        
        // Tratamento para usuário de teste - verificar se tem escolas reais antes
        if (String(userId) === '1003') {
          console.log("Gestor de teste detectado: verificando se já existe escola real associada");
          
          try {
            // Verificar pelo ID
            const { data: testSchools, error: testError } = await supabase
              .from('escolas')
              .select('*')
              .eq('gestor_id', 1003)
              .limit(1);
              
            if (!testError && testSchools && testSchools.length > 0) {
              const realSchool = testSchools[0];
              console.log(`Escola real encontrada para usuário de teste: ${realSchool.id}`);
              
              // Atualizar sessão
              if (req.session) {
                req.session.escola_id = realSchool.id;
              }
              
              // Criar vínculo na tabela perfis_gestor
              await criarVinculoGestorEscola(userId, realSchool.id);
              
              return res.status(200).json({
                hasSchool: true,
                school: realSchool
              });
            }
          } catch (testSchoolError) {
            console.error('Erro ao verificar escola real para usuário de teste:', testSchoolError);
          }
        }
        
        // Função auxiliar para criar vínculo gestor-escola
        async function criarVinculoGestorEscola(userId, escolaId) {
          try {
            // Verificar se já existe vínculo
            const { data: existingVinculo, error: checkError } = await supabase
              .from('perfis_gestor')
              .select('id')
              .eq('usuario_id', userId)
              .eq('escola_id', escolaId)
              .maybeSingle();
              
            if (checkError) {
              console.error('Erro ao verificar vínculo existente:', checkError);
              return false;
            }
            
            if (existingVinculo) {
              console.log('Vínculo já existe:', existingVinculo.id);
              return true;
            }
            
            // Criar novo vínculo
            const { data: novoVinculo, error: insertError } = await supabase
              .from('perfis_gestor')
              .insert({
                usuario_id: userId,
                escola_id: escolaId,
                cargo: 'Gestor Escolar',
                nivel_acesso: 'completo',
                data_vinculo: new Date().toISOString()
              })
              .select()
              .single();
              
            if (insertError) {
              console.error('Erro ao criar vínculo gestor-escola:', insertError);
              return false;
            }
            
            console.log('Vínculo gestor-escola criado com sucesso:', novoVinculo.id);
            return true;
          } catch (vinculoError) {
            console.error('Erro ao criar vínculo gestor-escola:', vinculoError);
            return false;
          }
        }
        
        console.log('Nenhuma escola encontrada para o gestor');
        
        // Não tem escola
        return res.status(404).json({ message: 'School not found', hasSchool: false });
      } catch (error) {
        console.error('Erro ao verificar escola do gestor:', error);
        return res.status(500).json({ message: 'Erro ao verificar escola' });
      }
    }
  );

  /**
   * Rota para verificar se o gestor possui escolas cadastradas
   * Acessível apenas para gestores
   */
  app.get(
    '/api/schools/check-has-schools',
    authenticate,
    requireRole(['manager']),
    async (req: Request, res: Response) => {
      try {
        // O middleware requireRole já verificou a permissão
        
        // Verificar se há escola_id na sessão (abordagem simplificada)
        if (req.session?.escola_id) {
          console.log(`Escola encontrada na sessão: ${req.session.escola_id}`);
          return res.status(200).json({ 
            hasSchools: true,
            count: 1 
          });
        }
        
        // Verificar se o usuário de teste tem dados reais
        if (String(req.session.userId) === '1003') {
          console.log('Verificando se o usuário de teste possui escolas reais');
          try {
            // Verificar na tabela perfis_gestor
            const { count: perfilCount, error: perfilTestError } = await supabase
              .from('perfis_gestor')
              .select('*', { count: 'exact', head: true })
              .eq('usuario_id', 1003);
              
            if (!perfilTestError && perfilCount && perfilCount > 0) {
              console.log(`Encontrados ${perfilCount} vínculos para usuário de teste`);
              return res.status(200).json({ 
                hasSchools: true,
                count: perfilCount
              });
            }
            
            // Verificar na tabela escolas
            const { count: escolaCount, error: escolaTestError } = await supabase
              .from('escolas')
              .select('*', { count: 'exact', head: true })
              .eq('gestor_id', 1003);
              
            if (!escolaTestError && escolaCount && escolaCount > 0) {
              console.log(`Encontradas ${escolaCount} escolas para usuário de teste`);
              return res.status(200).json({ 
                hasSchools: true,
                count: escolaCount
              });
            }
          } catch (testError) {
            console.error('Erro ao verificar escolas para usuário de teste:', testError);
          }
        }
        
        // Tenta buscar do Supabase (modo completo)
        try {
          // Primeiro verificar na tabela perfis_gestor
          const { count: perfilCount, error: perfilError } = await supabase
            .from('perfis_gestor')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', req.session.userId);
            
          if (!perfilError && perfilCount && perfilCount > 0) {
            return res.status(200).json({ 
              hasSchools: true,
              count: perfilCount
            });
          }
          
          // Se não encontrar na tabela perfis_gestor, verificar na tabela escolas
          const { count, error } = await supabase
            .from('escolas')
            .select('*', { count: 'exact', head: true })
            .eq('gestor_id', req.session.userId);
            
          if (!error && count && count > 0) {
            return res.status(200).json({ 
              hasSchools: true,
              count: count 
            });
          }
        } catch (supabaseError) {
          console.error('Erro ao verificar escolas no Supabase:', supabaseError);
          // Continue para a resposta padrão
        }
        
        // Se nenhuma escola for encontrada
        return res.status(404).json({ 
          message: 'School not found',
          hasSchools: false,
          count: 0
        });
      } catch (error) {
        console.error('Erro ao verificar escolas do gestor:', error);
        return res.status(500).json({ 
          message: 'Erro ao verificar escolas do gestor' 
        });
      }
    }
  );
  
  // Endpoint único para verificar escola do gestor já foi definido acima

  /**
   * Rota para listar todas as escolas
   * Acessível apenas para administradores e gestores
   */
  app.get(
    '/api/schools',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        // Verificar se o usuário é um gestor
        if (req.session.userRole === 'manager') {
          // Para o usuário de teste, verificar se tem dados reais primeiro
          if (isTestUser(req.session.userId)) {
            console.log('Verificando escolas reais para gestor de teste');
            
            // Verificar primeiro na tabela perfis_gestor
            try {
              const { data: perfilData, error: perfilError } = await supabase
                .from('perfis_gestor')
                .select('escola_id, escolas:escola_id(*)')
                .eq('usuario_id', 1003);
                
              if (!perfilError && perfilData && perfilData.length > 0) {
                // Extrair as escolas dos perfis
                const escolasVinculadas = perfilData
                  .filter(perfil => perfil.escolas)
                  .map(perfil => perfil.escolas);
                  
                if (escolasVinculadas.length > 0) {
                  console.log(`Encontradas ${escolasVinculadas.length} escolas reais via perfis para usuário de teste`);
                  return res.status(200).json(escolasVinculadas);
                }
              }
            } catch (perfilError) {
              console.error('Erro ao buscar perfis para usuário de teste:', perfilError);
            }
          }
          
          // Buscar apenas as escolas associadas ao gestor
          const { data, error } = await supabase
            .from('escolas')
            .select('*')
            .eq('gestor_id', req.session.userId);
            
          if (error) {
            console.error('Erro ao buscar escolas do gestor:', error);
            
            // Se for gestor de teste e ocorrer erro, tentar buscar via perfil
            if (isTestUser(req.session.userId)) {
              console.log('Erro na busca direta. Tentando buscar via perfis para usuário de teste');
              
              try {
                // Tentar via perfis
                const { data: perfilData, error: perfilTestError } = await supabase
                  .from('perfis_gestor')
                  .select('escola_id, escolas:escola_id(*)')
                  .eq('usuario_id', 1003)
                  .limit(10);
                  
                if (!perfilTestError && perfilData && perfilData.length > 0) {
                  // Extrair escolas
                  const escolas = perfilData
                    .filter(p => p.escolas)
                    .map(p => p.escolas);
                    
                  if (escolas.length > 0) {
                    console.log(`Encontradas ${escolas.length} escolas via perfis para usuário de teste`);
                    return res.status(200).json(escolas);
                  }
                }
              } catch (testError) {
                console.error('Erro ao buscar via perfis para usuário de teste:', testError);
              }
              
              // Se falhou, retornar array vazio em vez de dados simulados
              return res.status(200).json([]);
            }
            
            throw error;
          }
          
          // Se não encontrou nenhuma escola no banco e é usuário de teste
          if ((!data || data.length === 0) && isTestUser(req.session.userId)) {
            console.log('Nenhuma escola encontrada para o usuário de teste via gestor_id');
            
            // Verificar na tabela de perfis
            try {
              const { data: perfilData, error: perfilError } = await supabase
                .from('perfis_gestor')
                .select('escola_id, escolas:escola_id(*)')
                .eq('usuario_id', 1003);
                
              if (!perfilError && perfilData && perfilData.length > 0) {
                const escolasVinculadas = perfilData
                  .filter(p => p.escolas)
                  .map(p => p.escolas);
                  
                if (escolasVinculadas.length > 0) {
                  console.log(`Encontradas ${escolasVinculadas.length} escolas via perfis para usuário de teste`);
                  return res.status(200).json(escolasVinculadas);
                }
              }
            } catch (perfilTestError) {
              console.error('Erro ao buscar perfis para usuário de teste:', perfilTestError);
            }
            
            // Se não encontrou nada, retornar array vazio
            return res.status(200).json([]);
          }
          
          return res.status(200).json(data || []);
        }
        
        // Se for administrador, buscar todas as escolas
        const { data, error } = await supabase
          .from('escolas')
          .select('*');
          
        if (error) throw error;
        
        return res.status(200).json(data || []);
      } catch (error) {
        console.error('Erro ao buscar escolas:', error);
        return res.status(500).json({ message: 'Erro ao buscar escolas' });
      }
    }
  );

  /**
   * Rota para obter detalhes de uma escola específica
   * Acessível para administradores e gestores
   */
  app.get(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Verificar se o usuário é um gestor
        if (req.session.userRole === 'manager') {
          // Para usuários de teste, buscar escola real pelo ID
          if (isTestUser(req.session.userId)) {
            console.log(`Buscando escola real com ID ${schoolId} para usuário de teste`);
            
            // Primeiro verificar acesso via perfil_gestor
            try {
              const { data: perfilData, error: perfilError } = await supabase
                .from('perfis_gestor')
                .select('escola_id, escolas:escola_id(*)')
                .eq('usuario_id', 1003)
                .eq('escola_id', schoolId)
                .maybeSingle();
                
              if (!perfilError && perfilData && perfilData.escolas) {
                console.log(`Escola encontrada via perfil para usuário de teste: ${perfilData.escolas.id}`);
                return res.status(200).json(perfilData.escolas);
              }
            } catch (perfilError) {
              console.error('Erro ao verificar perfil do gestor de teste:', perfilError);
            }
          }
          
          // Garantir que o gestor só acesse escolas vinculadas a ele
          try {
            const { data, error } = await supabase
              .from('escolas')
              .select('*')
              .eq('id', schoolId)
              .eq('gestor_id', req.session.userId)
              .single();
              
            if (error) {
              if (error.code === 'PGRST116') {
                return res.status(404).json({ message: 'Escola não encontrada' });
              }
              throw error;
            }
            
            return res.status(200).json(data);
          } catch (error) {
            console.error('Erro ao buscar escola específica:', error);
            
            // Se for gestor de teste e ocorrer erro, tentar usando perfis
            if (isTestUser(req.session.userId)) {
              console.log('Erro ao buscar escola diretamente. Tentando via perfis para gestor de teste');
              
              try {
                // Tentar via perfis
                const { data: perfilData, error: perfilError } = await supabase
                  .from('perfis_gestor')
                  .select('escola_id, escolas:escola_id(*)')
                  .eq('usuario_id', 1003)
                  .eq('escola_id', schoolId)
                  .maybeSingle();
                  
                if (!perfilError && perfilData && perfilData.escolas) {
                  console.log(`Escola encontrada via perfil após falha inicial: ${perfilData.escolas.id}`);
                  return res.status(200).json(perfilData.escolas);
                }
              } catch (perfilError) {
                console.error('Erro ao verificar perfil secundário:', perfilError);
              }
              
              // Se todas as tentativas falharem
              return res.status(404).json({ message: 'Escola não encontrada' });
            }
            
            throw error;
          }
        }
        
        // Se for administrador, buscar a escola sem restrições
        const { data, error } = await supabase
          .from('escolas')
          .select('*')
          .eq('id', schoolId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            return res.status(404).json({ message: 'Escola não encontrada' });
          }
          throw error;
        }
        
        return res.status(200).json(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes da escola:', error);
        return res.status(500).json({ message: 'Erro ao buscar detalhes da escola' });
      }
    }
  );

  /**
   * Rota para cadastrar uma nova escola
   * Acessível apenas para administradores e gestores
   */
  app.post(
    '/api/schools',
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
          
          // Mapear os dados para o schema do Supabase
          const escolaInsert = {
            nome: schoolData.nome,
            codigo_escola: schoolData.codigo_escola || '',
            tipo: schoolData.tipo,
            cidade: schoolData.cidade, 
            estado: schoolData.estado,
            telefone: schoolData.telefone,
            gestor_id: userId,
            // Campos opcionais
            modalidade_ensino: schoolData.modalidade_ensino || null,
            zona_geografica: schoolData.zona_geografica || null,
            endereco_completo: schoolData.endereco_completo || null,
            email_institucional: schoolData.email_institucional || null
          };
          
          console.log('Inserindo escola com dados:', escolaInsert);
          
          // Salvar a escola no banco de dados
          const { data: insertedSchool, error } = await supabase
            .from('escolas')
            .insert(escolaInsert)
            .select()
            .single();
          
          if (error) {
            console.error('Erro ao inserir escola no Supabase:', error);
            // Enviar a mensagem de erro para diagnóstico
            return res.status(500).json({ 
              message: 'Erro ao cadastrar escola no banco de dados', 
              error: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code 
            });
          }
          
          if (!insertedSchool || !insertedSchool.id) {
            console.error('Escola inserida, mas ID não retornado');
            return res.status(500).json({ 
              message: 'Falha ao obter ID da escola cadastrada'
            });
          }
          
          // Escola salva com sucesso
          const schoolId = insertedSchool.id;
          console.log(`Escola cadastrada com sucesso. ID: ${schoolId}`);
          
          // Criar vínculo na tabela perfis_gestor
          const perfilInsert = {
            usuario_id: userId,
            escola_id: schoolId,
            cargo: 'Gestor Escolar',
            nivel_acesso: 'completo',
            data_vinculo: new Date().toISOString()
          };
          
          const { data: perfilGestor, error: perfilError } = await supabase
            .from('perfis_gestor')
            .insert(perfilInsert)
            .select()
            .single();
          
          if (perfilError) {
            console.error('Erro ao criar perfil do gestor:', perfilError);
            // Continuar mesmo com erro no perfil, pois a escola já foi criada
          } else {
            console.log('Perfil de gestor criado com sucesso. ID:', perfilGestor?.id);
          }
          
          // Adicionar ID da escola à sessão do usuário
          req.session.escola_id = schoolId;
          console.log(`Escola ID ${schoolId} vinculada ao gestor na sessão`);
          
          // Agora, buscar a escola completa para garantir que temos todos os campos
          const { data: escolaCompleta, error: errorFetch } = await supabase
            .from('escolas')
            .select('*')
            .eq('id', schoolId)
            .single();
            
          if (errorFetch) {
            console.error('Erro ao recuperar escola recém-criada:', errorFetch);
            // Retornar os dados inseridos mesmo assim, pois sabemos que a escola foi criada
            return res.status(201).json(insertedSchool);
          }
          
          // Retornar os dados completos da escola inserida
          return res.status(201).json(escolaCompleta);
        }
        
        // Para administradores
        if (req.session.userRole === 'admin') {
          // Processar a criação da escola pelo administrador
          const { data: insertedSchool, error } = await supabase
            .from('escolas')
            .insert({
              nome: schoolData.nome,
              codigo_escola: schoolData.codigo_escola || '',
              tipo: schoolData.tipo,
              modalidade_ensino: schoolData.modalidade_ensino,
              cidade: schoolData.cidade,
              estado: schoolData.estado,
              zona_geografica: schoolData.zona_geografica,
              endereco_completo: schoolData.endereco_completo,
              telefone: schoolData.telefone,
              email_institucional: schoolData.email_institucional || null
            })
            .select()
            .single();
            
          if (error) {
            console.error('Erro ao inserir escola como administrador:', error);
            return res.status(500).json({ message: 'Erro ao cadastrar escola: ' + error.message });
          }
          
          return res.status(201).json(insertedSchool);
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

  /**
   * Rota para atualizar uma escola existente
   * Acessível apenas para administradores e gestores da escola
   */
  app.put(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin', 'manager']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Validar os dados de entrada
        const validationResult = schoolSchema.safeParse(req.body);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: 'Dados inválidos', 
            errors: validationResult.error.format() 
          });
        }
        
        const schoolData = validationResult.data;
        
        // Se o usuário for gestor, verificar se a escola pertence a ele
        if (req.session.userRole === 'manager') {
          const { data, error } = await supabase
            .from('escolas')
            .select('gestor_id')
            .eq('id', schoolId)
            .single();
            
          if (error) {
            if (error.code === 'PGRST116') {
              return res.status(404).json({ message: 'Escola não encontrada' });
            }
            throw error;
          }
          
          if (data.gestor_id !== String(req.session.userId)) {
            return res.status(403).json({ message: 'Você não tem permissão para atualizar esta escola' });
          }
          
          // Garantir que o gestor_id não seja alterado
          schoolData.gestor_id = String(req.session.userId);
        }
        
        // Atualizar os dados da escola
        const { data, error } = await supabase
          .from('escolas')
          .update(schoolData)
          .eq('id', schoolId)
          .select()
          .single();
          
        if (error) throw error;
        
        return res.status(200).json(data);
      } catch (error) {
        console.error('Erro ao atualizar escola:', error);
        return res.status(500).json({ message: 'Erro ao atualizar escola' });
      }
    }
  );

  /**
   * Rota para excluir uma escola
   * Acessível apenas para administradores
   */
  app.delete(
    '/api/schools/:id',
    authenticate,
    requireRole(['admin']),
    async (req: Request, res: Response) => {
      try {
        const schoolId = req.params.id;
        
        // Apenas administradores podem excluir escolas
        const { error } = await supabase
          .from('escolas')
          .delete()
          .eq('id', schoolId);
          
        if (error) throw error;
        
        return res.status(204).send();
      } catch (error) {
        console.error('Erro ao excluir escola:', error);
        return res.status(500).json({ message: 'Erro ao excluir escola' });
      }
    }
  );
  
}