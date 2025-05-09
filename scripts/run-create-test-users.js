import { exec } from 'child_process';

// Executa o script com o Node
exec('NODE_ENV=development node scripts/create-test-users.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Erro no script: ${stderr}`);
    return;
  }
  
  console.log(`Resultado da execução:\n${stdout}`);
});