import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL.replace('postgresql://', '').split('@')[1].split('/')[0];
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(`https://${supabaseUrl.split(':')[0]}`, supabaseKey);

async function corrigirVinculoGestor() {
  try {
    console.log('🔧 Corrigindo vínculo do gestor com as escolas...');
    
    const gestorId = '72e7feef-0741-46ec-bdb4-68dcdfc6defe';
    const escolaId2 = '3aa2a8a7-141b-42d9-af55-a656247c73b3'; // U.E. DEUS NOS ACUDA
    
    // Verificar perfis existentes
    console.log('📋 Verificando perfis de gestor existentes...');
    const { data: perfisExistentes, error: errorPerfis } = await supabase
      .from('perfis_gestor')
      .select('*')
      .eq('usuario_id', gestorId);
    
    if (errorPerfis) {
      console.error('❌ Erro ao buscar perfis:', errorPerfis);
      return;
    }
    
    console.log(`📊 Perfis encontrados: ${perfisExistentes.length}`);
    perfisExistentes.forEach(perfil => {
      console.log(`   - Escola ID: ${perfil.escola_id}`);
    });
    
    // Verificar se já existe vínculo com a segunda escola
    const vinculoExiste = perfisExistentes.some(p => p.escola_id === escolaId2);
    
    if (!vinculoExiste) {
      console.log('➕ Criando vínculo com a segunda escola...');
      
      const { data: novoVinculo, error: errorInsert } = await supabase
        .from('perfis_gestor')
        .insert({
          usuario_id: gestorId,
          escola_id: escolaId2,
          ativo: true
        })
        .select();
      
      if (errorInsert) {
        console.error('❌ Erro ao criar vínculo:', errorInsert);
        return;
      }
      
      console.log('✅ Vínculo criado com sucesso:', novoVinculo);
    } else {
      console.log('ℹ️  Vínculo já existe com a segunda escola');
    }
    
    // Verificar resultado final
    console.log('🔍 Verificando resultado final...');
    const { data: perfisFinais, error: errorFinal } = await supabase
      .from('perfis_gestor')
      .select(`
        *,
        escolas (
          id,
          nome
        )
      `)
      .eq('usuario_id', gestorId)
      .eq('ativo', true);
    
    if (errorFinal) {
      console.error('❌ Erro na verificação final:', errorFinal);
      return;
    }
    
    console.log(`✅ RESULTADO FINAL: ${perfisFinais.length} escolas vinculadas`);
    perfisFinais.forEach(perfil => {
      console.log(`   - ${perfil.escolas.nome} (ID: ${perfil.escola_id})`);
    });
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

corrigirVinculoGestor();