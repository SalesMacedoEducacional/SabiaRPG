import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function QuickLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Login realizado',
          description: 'Você foi autenticado com sucesso',
        });
        
        // Redirect to manager dashboard to test class creation
        setLocation('/manager');
      } else {
        throw new Error('Falha no login');
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: 'Verifique suas credenciais e tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setEmail('gestor@teste.com');
    setPassword('123456');
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email: 'gestor@teste.com',
        password: '123456'
      });

      if (response.ok) {
        toast({
          title: 'Login rápido realizado',
          description: 'Acesso como gestor para teste do vínculo escola-turma',
        });
        setLocation('/manager');
      }
    } catch (error) {
      toast({
        title: 'Erro no login rápido',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login Rápido - Teste Vínculo Escola-Turma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="text-center text-sm text-gray-500">ou</div>
          
          <Button 
            onClick={handleQuickLogin} 
            variant="outline" 
            className="w-full"
            disabled={isLoading}
          >
            Login Rápido (Gestor Teste)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}