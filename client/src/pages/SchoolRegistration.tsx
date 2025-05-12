import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import ManagerSchoolRegistration from "@/components/manager/ManagerSchoolRegistration";

// Componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, School, ArrowRight, ArrowLeft } from "lucide-react";

export default function SchoolRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSchool, setHasSchool] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  
  // Verificar se o gestor já tem uma escola cadastrada
  useEffect(() => {
    const checkManagerSchool = async () => {
      try {
        const response = await apiRequest("GET", "/api/schools/check-manager-school");
        const data = await response.json();
        
        setHasSchool(data.hasSchool);
        if (data.hasSchool) {
          setSchoolData(data.school);
        }
      } catch (error) {
        console.error("Erro ao verificar escola do gestor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.role === "manager") {
      checkManagerSchool();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando seus dados...</p>
      </div>
    );
  }
  
  // Renderizar mensagem se o gestor já tiver uma escola cadastrada
  if (hasSchool && schoolData) {
    return (
      <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col justify-center">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <School className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Escola Já Cadastrada</CardTitle>
            <CardDescription className="text-center">
              Você já possui uma escola registrada no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-xl mb-2">{schoolData.nome}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Código:</span> {schoolData.codigo_escola || "Não informado"}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span> {schoolData.tipo}
                  </div>
                  <div>
                    <span className="font-medium">Modalidade:</span> {schoolData.modalidade_ensino || schoolData.modalidade}
                  </div>
                  <div>
                    <span className="font-medium">Cidade/Estado:</span> {schoolData.cidade}/{schoolData.estado}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {schoolData.telefone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {schoolData.email_institucional || schoolData.email || "Não informado"}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={() => setLocation("/manager")}>
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={logout}>
                  Sair
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Se precisar modificar os dados da escola, acesse as configurações no painel de gestão
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Renderizar formulário de cadastro
  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col justify-center">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/manager")}
            className="bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Dashboard
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout} 
            className="text-muted-foreground hover:text-foreground"
          >
            Sair
          </Button>
        </div>
        
        <div className="bg-primary/10 p-3 rounded-full">
          <School className="h-10 w-10 text-primary" />
        </div>
        <div className="w-16"></div> {/* Espaçador para centralizar o ícone */}
      </div>
      
      <ManagerSchoolRegistration 
        userId={user?.id || ''} 
        onSchoolRegistered={(result) => {
          // Atualizar perfil do gestor com o ID da escola
          try {
            // Primeiro atualizar localmente sem depender do servidor
            console.log('Atualizando contexto local com escola_id:', result.id);
            updateUser({ escola_id: result.id });
            
            // Em seguida, tentar a atualização no servidor de forma não-bloqueante
            apiRequest("PATCH", "/api/users/update-profile", {
              escola_id: result.id
            }).then(response => {
              if (response.ok) {
                console.log('Servidor confirmou atualização do gestor com escola');
              } else {
                console.log('Servidor não atualizou o gestor, mas continuaremos com o fluxo local');
              }
            }).catch(err => {
              console.error('Erro ao comunicar com o servidor para atualizar gestor:', err);
            });
          } catch (error) {
            console.warn('Erro ao atualizar contexto local:', error);
          }
          
          // Notificar usuário
          toast({
            title: "Escola cadastrada com sucesso!",
            description: "Você será redirecionado para o painel do gestor.",
          });
          
          // Redirecionar para o dashboard do gestor
          setTimeout(() => {
            setLocation("/manager");
          }, 1500);
        }}
      />
    </div>
  );
}