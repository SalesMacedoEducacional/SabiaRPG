import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";

// Componentes UI
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, School, ArrowRight } from "lucide-react";

// Lista de estados brasileiros
const estadosBrasileiros = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

// Schema de validação do formulário
const schoolSchema = z.object({
  nome: z.string().min(3, "O nome da escola deve ter pelo menos 3 caracteres"),
  codigo_escola: z.string().min(1, "O código da escola é obrigatório"),
  tipo: z.enum(["estadual", "municipal", "particular", "federal"], {
    required_error: "Selecione o tipo de escola",
  }),
  modalidade_ensino: z.string().min(2, "Informe a modalidade de ensino"),
  cidade: z.string().min(2, "Informe a cidade"),
  estado: z.string({
    required_error: "Selecione o estado",
  }),
  zona_geografica: z.enum(["urbana", "rural"], {
    required_error: "Selecione a zona geográfica",
  }),
  endereco_completo: z.string().min(5, "Informe o endereço completo"),
  telefone: z
    .string()
    .min(14, "Formato de telefone inválido")
    .max(15, "Formato de telefone inválido"),
  email_institucional: z.string().email("E-mail inválido").optional().or(z.literal("")),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

export default function SchoolRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, logout, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Inicializar formulário com react-hook-form e validação de zod
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      nome: "",
      codigo_escola: "",
      tipo: undefined,
      modalidade_ensino: "",
      cidade: "",
      estado: "",
      zona_geografica: undefined,
      endereco_completo: "",
      telefone: "",
      email_institucional: "",
    },
  });

  // Função para aplicar máscara de telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length <= 10) {
      // Formato (99) 9999-9999
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    } else {
      // Formato (99) 99999-9999
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    
    form.setValue("telefone", value);
  };

  // Função de envio do formulário
  const onSubmit = async (data: SchoolFormData) => {
    setIsSubmitting(true);
    
    try {
      // Adicionar o ID do gestor aos dados da escola
      const schoolData = {
        ...data,
        gestor_id: user?.id,
      };
      
      // Enviar dados para API
      const response = await apiRequest("POST", "/api/schools", schoolData);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Erro ao cadastrar escola");
      }
      
      const result = await response.json();
      console.log("Escola cadastrada com sucesso:", result);
      
      // Atualizar perfil do gestor com o ID da escola
      const updateResponse = await apiRequest("PATCH", "/api/users/update-profile", {
        escola_id: result.id
      });
      
      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        throw new Error(updateError.message || "Erro ao vincular gestor à escola");
      }
      
      toast({
        title: "Escola cadastrada com sucesso!",
        description: "Você será redirecionado para o painel do gestor.",
      });
      
      // Atualizar contexto do usuário
      if (user) {
        // Atualizar contexto do usuário com o ID da escola
        updateUser({ escola_id: result.id });
        console.log('Contexto do usuário atualizado com escola_id:', result.id);
      }
      
      // Redirecionar para o dashboard do gestor
      setTimeout(() => {
        setLocation("/manager");
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao cadastrar escola:", error);
      toast({
        title: "Erro ao cadastrar escola",
        description: error instanceof Error ? error.message : "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <span className="font-medium">Modalidade:</span> {schoolData.modalidade_ensino}
                  </div>
                  <div>
                    <span className="font-medium">Cidade/Estado:</span> {schoolData.cidade}/{schoolData.estado}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {schoolData.telefone}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {schoolData.email_institucional || "Não informado"}
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
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <School className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Cadastro de Nova Escola</CardTitle>
          <CardDescription className="text-center">
            Por favor, preencha os dados da instituição de ensino que você irá gerenciar
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome da escola */}
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Nome da Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Escola Municipal Pedro II" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código da escola (opcional) */}
                <FormField
                  control={form.control}
                  name="codigo_escola"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Código da Escola</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 23456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Código INEP ou identificador interno
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo de escola */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Tipo de Escola</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="municipal">Municipal</SelectItem>
                          <SelectItem value="estadual">Estadual</SelectItem>
                          <SelectItem value="federal">Federal</SelectItem>
                          <SelectItem value="particular">Particular</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modalidade de ensino */}
                <FormField
                  control={form.control}
                  name="modalidade_ensino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Modalidade de Ensino</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Médio, Técnico, EJA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cidade */}
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Teresina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado */}
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosBrasileiros.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Zona geográfica */}
                <FormField
                  control={form.control}
                  name="zona_geografica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Zona Geográfica</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a zona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="urbana">Urbana</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Telefone */}
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel><span className="text-red-500 mr-1">*</span>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(99) 99999-9999" 
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePhoneChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* E-mail institucional (opcional) */}
                <FormField
                  control={form.control}
                  name="email_institucional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail Institucional (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Ex: contato@escola.edu.br"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Endereço completo */}
              <FormField
                control={form.control}
                name="endereco_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><span className="text-red-500 mr-1">*</span>Endereço Completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Rua das Flores, 123, Centro"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      Cadastrar Escola
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 justify-center items-center text-sm text-muted-foreground">
          <div>Todos os campos marcados são obrigatórios para o cadastro da escola</div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}