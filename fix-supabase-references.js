/**
 * Script para limpar todas as referências ao Supabase do código
 * e garantir que use exclusivamente PostgreSQL
 */

import fs from 'fs';
import path from 'path';

const filesToFix = [
  'server/routes.ts',
  'server/userManagementApi.ts', 
  'server/userRegistrationApi.ts'
];

function removeSupabaseReferences(filePath) {
  console.log(`🔧 Corrigindo ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remover imports do Supabase
  content = content.replace(/import.*supabase.*from.*['"].*supabase.*['"];?\s*/g, '');
  content = content.replace(/import.*initializeDatabase.*from.*['"].*supabase.*['"];?\s*/g, '');
  
  // Substituir chamadas do Supabase por PostgreSQL
  content = content.replace(/const\s+{\s*data:\s*(\w+),\s*error\s*}\s*=\s*await\s+supabase\s*\.from\(['"](\w+)['"]\)\s*\.select\([^)]*\)/g, 
    'const $1Result = await executeQuery(`SELECT * FROM $2`); const $1 = $1Result.rows; const error = null');
    
  content = content.replace(/await\s+supabase\s*\.from\(['"](\w+)['"]\)\s*\.delete\(\)\s*\.eq\(['"](\w+)['"],\s*(\w+)\)/g,
    'await executeQuery(`DELETE FROM $1 WHERE $2 = $1`, [$3])');
    
  content = content.replace(/await\s+supabase\s*\.from\(['"](\w+)['"]\)\s*\.insert\([^)]*\)/g,
    'await executeQuery(`INSERT INTO $1 (...) VALUES (...)`)');
  
  // Adicionar import do executeQuery se não existir
  if (!content.includes('import { executeQuery }')) {
    content = "import { executeQuery } from './database';\n" + content;
  }
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${filePath} corrigido`);
}

console.log('🚀 Iniciando correção das referências do Supabase...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    removeSupabaseReferences(filePath);
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
  }
});

console.log('✅ Correção concluída!');