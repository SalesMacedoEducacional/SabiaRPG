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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, School, ArrowRight, ArrowLeft, Plus, Building2, MapPin, Calendar, Users } from "lucide-react";

export default function SchoolRegistration() {
  // Função para renderizar a grade de escolas
  const renderEscolasGrid = () => {
    if (isLoadingEscolas) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-foreground">Carregando escolas...</span>
        </div>
      );
    }
    
    if (escolasCadastradas.length === 0) {
      return (
        <div className="text-center py-8">
          <School className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">Nenhuma escola cadastrada ainda.</p>
          <Button 
            onClick={() => setShowRegistrationForm(true)}
            className="mt-4 bg-[#43341c] border border-[#D47C06] text-white hover:bg-[#5a4828]"
          >
            <Plus className="h-4 w-4 mr-2" /> Cadastrar Escola
          </Button>
        </div>
      );
    }
    
    return (
      <div className="py-4">
        <h2 className="text-2xl font-bold mb-4 text-center text-foreground border-b pb-2 border-primary/30">
          Escolas Cadastradas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolasCadastradas.map((escola) => (
            <Card key={escola.id} className="bg-[#3B2B16] border-2 border-[#D47C06]/70 overflow-hidden">
              <CardHeader className="bg-[#43341c] pb-2 border-b border-[#D47C06]/50">
                <CardTitle className="text-lg text-foreground flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-primary" />
                  {escola.nome}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Código: {escola.codigo_escola || "Não informado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-foreground">{escola.cidade}, {escola.estado}</p>
                      <p className="text-muted-foreground text-xs">{escola.endereco}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-foreground">Tipo: {escola.tipo}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-foreground">Modalidade: {escola.modalidade_ensino || escola.modalidade}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#D47C06]/30 bg-[#3B2B16] pt-3 flex justify-between">
                <Button 
                  size="sm" 
                  className="text-xs bg-[#312e26] hover:bg-[#3f3a30] border border-[#D47C06]/50"
                  onClick={() => setLocation("/turmas")}
                >
                  Gerenciar Turmas
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs border-[#D47C06]/50 hover:bg-[#3f3a30]"
                  onClick={() => setLocation(`/escola/${escola.id}/editar`)}
                >
                  Editar Escola
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSchool, setHasSchool] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(true);
  const [escolasCadastradas, setEscolasCadastradas] = useState<any[]>([]);
  const [isLoadingEscolas, setIsLoadingEscolas] = useState(false);
  
  // Função para buscar escolas do gestor
  const fetchEscolas = async () => {
    setIsLoadingEscolas(true);
    try {
      const response = await apiRequest("GET", "/api/escolas/gestor");
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setEscolasCadastradas(data);
        setShowRegistrationForm(data.length === 0);
      }
    } catch (error) {
      console.error("Erro ao buscar escolas do gestor:", error);
      toast({
        title: "Erro ao carregar escolas",
        description: "Não foi possível carregar as escolas cadastradas",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEscolas(false);
    }
  };

  // Verificar se o gestor já tem uma escola cadastrada
  useEffect(() => {
    const checkManagerSchool = async () => {
      try {
        const response = await apiRequest("GET", "/api/schools/check-manager-school");
        const data = await response.json();
        
        setHasSchool(data.hasSchool);
        if (data.hasSchool) {
          setSchoolData(data.school);
          // Buscar todas as escolas do gestor
          fetchEscolas();
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
  }, [user, toast, fetchEscolas]);

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando seus dados...</p>
      </div>
    );
  }
  
  // Renderizar grade de escolas se o gestor já tiver uma escola cadastrada
  if (hasSchool) {
    return (
      <div className="container mx-auto p-4 max-w-4xl min-h-screen">
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
            
            {!showRegistrationForm && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRegistrationForm(true)}
                className="bg-[#43341c] border border-[#D47C06] text-white hover:bg-[#5a4828] flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" /> CADASTRAR NOVA ESCOLA
              </Button>
            )}
            
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
        
        <ScrollArea className="h-[calc(100vh-160px)]">
          {showRegistrationForm ? (
            <ManagerSchoolRegistration 
              userId={user?.id || ''} 
              onSchoolRegistered={(result) => {
                // Atualizar perfil do gestor com o ID da escola se ainda não tiver
                try {
                  if (result && result.success) {
                    // Feedback ao usuário
                    toast({
                      title: "Escola cadastrada com sucesso!",
                      description: "Sua escola foi cadastrada com sucesso.",
                    });
                    
                    // Atualizar a lista de escolas e mostrar a visualização de grade
                    fetchEscolas();
                    setShowRegistrationForm(false);
                  }
                } catch (error) {
                  console.error("Erro ao processar cadastro da escola:", error);
                }
              }}
            />
          ) : (
            renderEscolasGrid()
          )}
        </ScrollArea>
      </div>
    );
  }

  // Renderizar formulário de cadastro
  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen">
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
          if (result.success) {
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
                console.error('Erro ao atualizar perfil do gestor:', err);
              });
              
              // Feedback ao usuário
              toast({
                title: "Escola cadastrada com sucesso!",
                description: "Sua escola foi cadastrada com sucesso.",
              });
              
              // Redirecionar para o dashboard do gestor
              setTimeout(() => {
                fetchEscolas();
                setShowRegistrationForm(false);
                setHasSchool(true);
              }, 1500);
            } catch (error) {
              console.error("Erro ao atualizar perfil do gestor:", error);
            }
          }
        }}
      />
    </div>
  );
}