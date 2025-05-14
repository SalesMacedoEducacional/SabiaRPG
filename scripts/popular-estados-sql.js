// Script para popular a tabela de estados brasileiros via SQL
import { executeSql } from '../db/supabase.js';

async function popularEstadosComSQL() {
  try {
    console.log('Iniciando inserção de estados via SQL...');
    
    // Primeiro limpar a tabela para garantir que não haverá conflitos
    const sqlLimpar = `
      DELETE FROM public.estados WHERE id IS NOT NULL;
    `;
    
    // SQL para inserir todos os estados brasileiros
    const sqlInserir = `
      INSERT INTO public.estados (id, nome) VALUES
        ('AC', 'Acre'),
        ('AL', 'Alagoas'),
        ('AP', 'Amapá'),
        ('AM', 'Amazonas'),
        ('BA', 'Bahia'),
        ('CE', 'Ceará'),
        ('DF', 'Distrito Federal'),
        ('ES', 'Espírito Santo'),
        ('GO', 'Goiás'),
        ('MA', 'Maranhão'),
        ('MT', 'Mato Grosso'),
        ('MS', 'Mato Grosso do Sul'),
        ('MG', 'Minas Gerais'),
        ('PA', 'Pará'),
        ('PB', 'Paraíba'),
        ('PR', 'Paraná'),
        ('PE', 'Pernambuco'),
        ('PI', 'Piauí'),
        ('RJ', 'Rio de Janeiro'),
        ('RN', 'Rio Grande do Norte'),
        ('RS', 'Rio Grande do Sul'),
        ('RO', 'Rondônia'),
        ('RR', 'Roraima'),
        ('SC', 'Santa Catarina'),
        ('SP', 'São Paulo'),
        ('SE', 'Sergipe'),
        ('TO', 'Tocantins');
    `;
    
    // Executar a limpeza
    console.log('Limpando tabela de estados...');
    try {
      await executeSql(sqlLimpar);
      console.log('Tabela de estados limpa com sucesso.');
    } catch (limparError) {
      console.error('Erro ao limpar tabela de estados:', limparError);
      // Continuar mesmo com erro na limpeza
    }
    
    // Executar a inserção
    console.log('Inserindo estados...');
    await executeSql(sqlInserir);
    console.log('Estados inseridos com sucesso!');
    
    // Verificar a inserção
    const sqlVerificar = `SELECT COUNT(*) as total FROM public.estados;`;
    const resultado = await executeSql(sqlVerificar);
    console.log(`Verificação: ${resultado[0].total} estados inseridos.`);
    
  } catch (error) {
    console.error('Erro ao popular estados:', error);
  }
}

// Executar a função
popularEstadosComSQL();