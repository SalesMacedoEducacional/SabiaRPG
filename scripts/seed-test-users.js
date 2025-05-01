import bcrypt from 'bcryptjs';
import { supabase } from '../db/supabase.js';

async function seed() {
  const senhaHash = await bcrypt.hash('Senha123!', 10);

  try {
    console.log('🔄 Iniciando seed de dados de teste...');
    
    // Criar escola
    console.log('🏫 Criando escola de teste...');
    const { data: escolaExistente, error: escolaCheckError } = await supabase
      .from('escolas')
      .select('*')
      .eq('codigo_escola', 'PI001')
      .maybeSingle();
      
    if (escolaCheckError) {
      console.error('❌ Erro ao verificar escola:', escolaCheckError.message);
      if (escolaCheckError.code === '42P01') {
        console.error('❌ Tabela escolas não existe. Execute o SQL no painel do Supabase primeiro.');
        return;
      }
    }
    
    let escolaId;
    if (!escolaExistente) {
      const { data: novaEscola, error: escolaError } = await supabase
        .from('escolas')
        .insert([{ nome: 'Escola Estadual PI', codigo_escola: 'PI001' }])
        .select()
        .single();
        
      if (escolaError) {
        console.error('❌ Erro ao criar escola:', escolaError.message);
        return;
      }
      
      escolaId = novaEscola.id;
      console.log('✅ Escola criada com sucesso:', escolaId);
    } else {
      escolaId = escolaExistente.id;
      console.log('ℹ️ Escola já existe:', escolaId);
    }
    
    // Criar matrícula
    console.log('📝 Criando matrícula de teste...');
    const { data: matriculaExistente, error: matriculaCheckError } = await supabase
      .from('matriculas')
      .select('*')
      .eq('numero_matricula', 'MAT1001')
      .maybeSingle();
      
    if (matriculaCheckError && matriculaCheckError.code === '42P01') {
      console.error('❌ Tabela matriculas não existe. Execute o SQL no painel do Supabase primeiro.');
      return;
    }
    
    let matriculaId;
    if (!matriculaExistente) {
      const { data: novaMatricula, error: matriculaError } = await supabase
        .from('matriculas')
        .insert([{ escola_id: escolaId, numero_matricula: 'MAT1001', nome_aluno: 'João Silva', turma: '3º Ano A' }])
        .select()
        .single();
        
      if (matriculaError) {
        console.error('❌ Erro ao criar matrícula:', matriculaError.message);
        return;
      }
      
      matriculaId = novaMatricula.id;
      console.log('✅ Matrícula criada com sucesso:', matriculaId);
    } else {
      matriculaId = matriculaExistente.id;
      console.log('ℹ️ Matrícula já existe:', matriculaId);
    }
    
    // Criar usuário aluno
    console.log('👨‍🎓 Criando usuário aluno...');
    const { data: alunoExistente, error: alunoCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'aluno@exemplo.com')
      .maybeSingle();
      
    if (alunoCheckError && alunoCheckError.code === '42P01') {
      console.error('❌ Tabela usuarios não existe. Execute o SQL no painel do Supabase primeiro.');
      return;
    }
    
    let alunoId;
    if (!alunoExistente) {
      const { data: novoAluno, error: alunoError } = await supabase
        .from('usuarios')
        .insert([{ email: 'aluno@exemplo.com', senha_hash: senhaHash, papel: 'aluno' }])
        .select()
        .single();
        
      if (alunoError) {
        console.error('❌ Erro ao criar usuário aluno:', alunoError.message);
        return;
      }
      
      alunoId = novoAluno.id;
      console.log('✅ Usuário aluno criado com sucesso:', alunoId);
      
      // Criar perfil de aluno
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis_aluno')
        .insert([{ usuario_id: alunoId, matricula_id: matriculaId, nivel: 1, xp: 0 }])
        .select()
        .single();
        
      if (perfilError) {
        console.error('❌ Erro ao criar perfil do aluno:', perfilError.message);
        // Não retornamos aqui, pois os outros usuários ainda podem ser criados
      } else {
        console.log('✅ Perfil de aluno criado com sucesso:', perfil.id);
      }
    } else {
      console.log('ℹ️ Usuário aluno já existe:', alunoExistente.id);
    }
    
    // Criar usuário professor
    console.log('👨‍🏫 Criando usuário professor...');
    const { data: professorExistente, error: professorCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'professor@exemplo.com')
      .maybeSingle();
    
    if (!professorExistente && !professorCheckError) {
      const { data: novoProfessor, error: professorError } = await supabase
        .from('usuarios')
        .insert([{ email: 'professor@exemplo.com', senha_hash: senhaHash, papel: 'professor' }])
        .select()
        .single();
        
      if (professorError) {
        console.error('❌ Erro ao criar usuário professor:', professorError.message);
      } else {
        console.log('✅ Usuário professor criado com sucesso:', novoProfessor.id);
      }
    } else if (!professorCheckError) {
      console.log('ℹ️ Usuário professor já existe:', professorExistente.id);
    }
    
    // Criar usuário gestor
    console.log('👨‍💼 Criando usuário gestor...');
    const { data: gestorExistente, error: gestorCheckError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'gestor@exemplo.com')
      .maybeSingle();
    
    if (!gestorExistente && !gestorCheckError) {
      const { data: novoGestor, error: gestorError } = await supabase
        .from('usuarios')
        .insert([{ email: 'gestor@exemplo.com', senha_hash: senhaHash, papel: 'gestor' }])
        .select()
        .single();
        
      if (gestorError) {
        console.error('❌ Erro ao criar usuário gestor:', gestorError.message);
      } else {
        console.log('✅ Usuário gestor criado com sucesso:', novoGestor.id);
      }
    } else if (!gestorCheckError) {
      console.log('ℹ️ Usuário gestor já existe:', gestorExistente.id);
    }
    
    console.log('\n✅ Seed concluído com usuários de teste.');
    console.log('Usuários disponíveis:');
    console.log('- aluno@exemplo.com / Senha123!');
    console.log('- professor@exemplo.com / Senha123!');
    console.log('- gestor@exemplo.com / Senha123!');
    
  } catch (error) {
    console.error('❌ Erro geral durante o seed:', error.message);
  }
}

seed();