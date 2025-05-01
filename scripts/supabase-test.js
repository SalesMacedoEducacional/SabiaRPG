import { supabase } from '../db/supabase.js';

async function testSupabase() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Consultar usuários
    console.log('👥 Buscando usuários:');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*');
      
    if (usuariosError) {
      console.error('❌ Erro ao buscar usuários:', usuariosError.message);
    } else {
      console.log(`✅ Encontrados ${usuarios.length} usuários:`);
      usuarios.forEach(u => console.log(`  - ${u.email} (${u.papel})`));
    }
    
    // Consultar escolas
    console.log('\n🏫 Buscando escolas:');
    const { data: escolas, error: escolasError } = await supabase
      .from('escolas')
      .select('*');
      
    if (escolasError) {
      console.error('❌ Erro ao buscar escolas:', escolasError.message);
    } else {
      console.log(`✅ Encontradas ${escolas.length} escolas:`);
      escolas.forEach(e => console.log(`  - ${e.nome} (${e.codigo_escola})`));
    }
    
    // Consultar matrículas
    console.log('\n📝 Buscando matrículas:');
    const { data: matriculas, error: matriculasError } = await supabase
      .from('matriculas')
      .select('*');
      
    if (matriculasError) {
      console.error('❌ Erro ao buscar matrículas:', matriculasError.message);
    } else {
      console.log(`✅ Encontradas ${matriculas.length} matrículas:`);
      matriculas.forEach(m => console.log(`  - ${m.nome_aluno} (${m.numero_matricula})`));
    }
    
    // Consultar perfis de aluno
    console.log('\n👨‍🎓 Buscando perfis de aluno:');
    const { data: perfis, error: perfisError } = await supabase
      .from('perfis_aluno')
      .select(`
        *,
        usuarios (email, papel),
        matriculas (nome_aluno, numero_matricula)
      `);
      
    if (perfisError) {
      console.error('❌ Erro ao buscar perfis de aluno:', perfisError.message);
    } else {
      console.log(`✅ Encontrados ${perfis.length} perfis de aluno:`);
      perfis.forEach(p => {
        const email = p.usuarios?.email || 'sem email';
        const nome = p.matriculas?.nome_aluno || 'sem nome';
        console.log(`  - ${nome} (${email}) - Nível: ${p.nivel}, XP: ${p.xp}`);
      });
    }
    
    console.log('\n🎉 Teste concluído!');
  } catch (error) {
    console.error('❌ Erro geral durante o teste:', error.message);
  }
}

testSupabase();