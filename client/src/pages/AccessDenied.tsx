import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const AccessDenied: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const handleReturnToDashboard = () => {
    // Redirecionar para o dashboard apropriado baseado no papel do usuário
    if (user?.role === 'manager' || user?.papel === 'gestor') {
      setLocation('/manager');
    } else if (user?.role === 'teacher' || user?.papel === 'professor') {
      setLocation('/teacher');
    } else if (user?.role === 'student' || user?.papel === 'aluno') {
      setLocation('/');
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-dark-lighter rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
          <Shield className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="font-medieval text-3xl text-red-500 mb-4">Acesso Negado</h1>
        
        <p className="text-parchment mb-6">
          Você não possui permissão para acessar esta área da plataforma. 
          Esta funcionalidade pode estar restrita ao seu nível de acesso atual.
        </p>
        
        <div className="space-y-4">
          <Button
            onClick={handleReturnToDashboard}
            className="bg-primary hover:bg-primary-dark text-parchment w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retornar à Página Principal
          </Button>
          
          <p className="text-parchment-dark text-sm">
            Se você acredita que deveria ter acesso a esta área, entre em contato
            com um administrador ou professor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;