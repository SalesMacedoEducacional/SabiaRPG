import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  status_senha: string;
  criado_em: string;
}

export default function UserTestPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSenha, setTestSenha] = useState('');
  const [loginResult, setLoginResult] = useState<string>('');

  // Carregar lista de usuários
  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios || []);
      } else {
        toast.error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Testar login
  const testarLogin = async () => {
    if (!testEmail || !testSenha) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: testEmail,
        senha: testSenha
      });

      const data = await response.json();
      
      if (response.ok) {
        setLoginResult(`✅ LOGIN SUCESSO: ${data.usuario.nome} (${data.usuario.papel})`);
        toast.success('Login realizado com sucesso!');
      } else {
        setLoginResult(`❌ LOGIN FALHOU: ${data.erro || 'Erro desconhecido'}`);
        toast.error(data.erro || 'Falha no login');
      }
    } catch (error: any) {
      setLoginResult(`❌ ERRO: ${error.message}`);
      toast.error('Erro ao tentar fazer login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div className="min-h-screen bg-parchment p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-accent mb-6">Sistema de Teste - Usuários e Login</h1>
        
        {/* Seção de teste de login */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test-email">Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="usuario@sabiarpg.edu.br"
                />
              </div>
              <div>
                <Label htmlFor="test-senha">Senha</Label>
                <Input
                  id="test-senha"
                  type="password"
                  value={testSenha}
                  onChange={(e) => setTestSenha(e.target.value)}
                  placeholder="Senha@123"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={testarLogin} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Testando...' : 'Testar Login'}
                </Button>
              </div>
            </div>
            
            {loginResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded border">
                <strong>Resultado:</strong> {loginResult}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de usuários */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Usuários Cadastrados ({usuarios.length})</CardTitle>
            <Button onClick={carregarUsuarios} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
                  <Card key={usuario.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{usuario.nome}</h3>
                          <Badge variant={usuario.papel === 'gestor' ? 'default' : 'secondary'}>
                            {usuario.papel}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{usuario.email}</p>
                        <div className="flex justify-between text-xs">
                          <span className={`px-2 py-1 rounded ${
                            usuario.status_senha === 'Tem hash' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {usuario.status_senha}
                          </span>
                          <span className="text-gray-500">
                            {new Date(usuario.criado_em).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => {
                              setTestEmail(usuario.email);
                              setTestSenha('Senha@123');
                            }}
                          >
                            Testar com Senha@123
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>1. Usuários de Teste:</strong> gestor@sabiarpg.edu.br, professor@sabiarpg.edu.br, aluno@sabiarpg.edu.br</p>
              <p><strong>2. Senha Padrão:</strong> Senha@123</p>
              <p><strong>3. Sistema Expandido:</strong> Todos os usuários cadastrados no banco podem fazer login</p>
              <p><strong>4. Senhas Alternativas:</strong> O sistema tenta validar com senhas comuns (123456, senha123, etc.)</p>
              <p><strong>5. Redirecionamento:</strong> Gestores → /manager, Professores → /teacher, Alunos → /</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}