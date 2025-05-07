import { supabase } from '../db/supabase.js';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

/**
 * Gera um hash seguro para a senha usando SCRYPT
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<string>} - Hash no formato "hash.salt"
 */
async function hashPassword(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(senha, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Atualiza as senhas dos usuários para formato compatível
 */
async function atualizarSenhas() {
  try {
    console.log('🔄 Buscando usuários para atualizar senhas...');
    
    // Buscar todos os usuários
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, email, senha_hash, papel');
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${usuarios.length} usuários.`);
    
    // Senha padrão para todos os usuários em ambiente de desenvolvimento
    const senhaPadrao = 'senha_simples';
    
    // Atualizar cada usuário
    for (const usuario of usuarios) {
      console.log(`\n📝 Atualizando senha para ${usuario.email}`);
      
      console.log(`👉 Hash atual: ${usuario.senha_hash || 'Não definido'}`);
      
      // Verificar se o formato do hash atual é compatível
      if (usuario.senha_hash && usuario.senha_hash.includes('.')) {
        console.log('✅ Formato do hash já compatível. Pulando...');
        continue;
      }
      
      // Gerar novo hash
      const novoHash = await hashPassword(senhaPadrao);
      console.log(`👉 Novo hash gerado: ${novoHash.substring(0, 20)}...`);
      
      // Atualizar usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ senha_hash: novoHash })
        .eq('id', usuario.id);
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar senha para ${usuario.email}:`, updateError);
      } else {
        console.log(`✅ Senha atualizada com sucesso para ${usuario.email}`);
      }
    }
    
    console.log('\n🎉 Atualização de senhas concluída!');
    console.log('Agora você deve conseguir fazer login com a senha: senha_simples');
    
  } catch (error) {
    console.error('❌ Erro ao executar atualização de senhas:', error);
  }
}

// Executar função principal
atualizarSenhas();