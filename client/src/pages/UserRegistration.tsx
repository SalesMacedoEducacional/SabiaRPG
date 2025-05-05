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
import { Loader2, UserPlus, ArrowRight, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Interfaces
interface Turma {
  id: string;
  nome: string;
  serie: string;
}

// Schema de validação do formulário
const baseUserSchema = z.object({
  nome_completo: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(14, "Formato de telefone inválido").max(15, "Formato de telefone inválido"),
  data_nascimento: z.date({
    required_error: "A data de nascimento é obrigatória",
  }),
  papel: z.enum(["aluno", "professor", "gestor"], {
    required_error: "Selecione o perfil do usuário",
  }),
  imagem_perfil: z.instanceof(File).optional(),
});

// Esquema para alunos
const alunoSchema = baseUserSchema.extend({
  turma_id: z.string({
    required_error: "Selecione a turma do aluno",
  }),
  numero_matricula: z.string().min(1, "O número de matrícula é obrigatório"),
});

// Esquema para professores
const professorSchema = baseUserSchema.extend({
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
});

// Esquema para gestores
const gestorSchema = baseUserSchema;

// Esquema condicional com base no papel selecionado
const userSchema = baseUserSchema.refine(
  (data) => {
    if (data.papel === "aluno") {
      return "turma_id" in data && "numero_matricula" in data;
    }
    if (data.papel === "professor") {
      return "cpf" in data;
    }
    return true;
  },
  {
    message: "Preencha todos os campos obrigatórios",
    path: ["papel"],
  }
);

type UserFormData = z.infer<typeof baseUserSchema> & {
  turma_id?: string;
  numero_matricula?: string;
  cpf?: string;
};

export default function UserRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [formStep, setFormStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Inicializar formulário com react-hook-form e validação de zod
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      telefone: "",
      papel: undefined,
    },
  });

  const papel = form.watch("papel");

  // Carregar turmas disponíveis
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await apiRequest("GET", "/api/turmas");
        if (response.ok) {
          const data = await response.json();
          setTurmas(data);
        } else {
          // Dados de exemplo para teste
          setTurmas([
            { id: "1", nome: "6º Ano A", serie: "6º Ano" },
            { id: "2", nome: "7º Ano A", serie: "7º Ano" },
            { id: "3", nome: "8º Ano A", serie: "8º Ano" },
            { id: "4", nome: "9º Ano A", serie: "9º Ano" },
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar turmas:", error);
        toast({
          title: "Erro ao carregar turmas",
          description: "Não foi possível obter a lista de turmas disponíveis.",
          variant: "destructive",
        });
      }
    };

    fetchTurmas();
  }, [toast]);

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

  // Função para aplicar máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    
    form.setValue("cpf", value);
  };

  // Função de envio do formulário
  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Adicionar campos básicos comuns a todos os papéis
      formData.append("nome_completo", data.nome_completo);
      formData.append("email", data.email);
      formData.append("telefone", data.telefone);
      formData.append("data_nascimento", data.data_nascimento.toISOString());
      formData.append("papel", data.papel);
      
      // Adicionar campos específicos com base no papel selecionado
      if (data.papel === "aluno" && data.turma_id && data.numero_matricula) {
        formData.append("turma_id", data.turma_id);
        formData.append("numero_matricula", data.numero_matricula);
      } else if (data.papel === "professor" && data.cpf) {
        formData.append("cpf", data.cpf);
      }
      
      // Adicionar imagem de perfil se disponível
      if (data.imagem_perfil) {
        formData.append("imagem_perfil", data.imagem_perfil);
      }
      
      // Enviar formulário para a API
      const response = await apiRequest("POST", "/api/users", formData, true);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar usuário");
      }
      
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: "O novo usuário foi adicionado ao sistema.",
      });
      
      // Opções após cadastro
      form.reset();
      setFormStep(0);
      
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      toast({
        title: "Erro ao cadastrar usuário",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar permissão para acessar esta página
  useEffect(() => {
    if (user && user.role !== 'manager') {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cadastro de Usuários</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation("/manager")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Cadastrar Novo Usuário</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados do novo usuário para cadastrá-lo na plataforma SABIÁ RPG
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {formStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="papel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perfil do Usuário</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset campos específicos ao trocar o papel
                              if (value === "aluno") {
                                form.setValue("cpf", "");
                              } else if (value === "professor") {
                                form.setValue("turma_id", "");
                                form.setValue("numero_matricula", "");
                              } else {
                                form.setValue("turma_id", "");
                                form.setValue("numero_matricula", "");
                                form.setValue("cpf", "");
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o perfil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aluno">Aluno</SelectItem>
                              <SelectItem value="professor">Professor</SelectItem>
                              <SelectItem value="gestor">Gestor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            O perfil determina as permissões do usuário na plataforma
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nome_completo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Maria Silva Santos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Ex: maria.silva@exemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Nascimento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    field.onChange(date);
                                  }
                                }}
                                disabled={(date) => {
                                  // Desabilitar datas futuras
                                  return date > new Date();
                                }}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={() => {
                          // Validar os campos da primeira etapa antes de avançar
                          form.trigger(['nome_completo', 'email', 'telefone', 'data_nascimento', 'papel']);
                          const hasErrors = !!form.formState.errors.nome_completo || 
                                          !!form.formState.errors.email ||
                                          !!form.formState.errors.telefone ||
                                          !!form.formState.errors.data_nascimento ||
                                          !!form.formState.errors.papel;
                          
                          if (!hasErrors && form.getValues('papel')) {
                            setFormStep(1);
                          }
                        }}
                      >
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {formStep === 1 && (
                <div className="space-y-6">
                  {papel === "aluno" && (
                    <>
                      <FormField
                        control={form.control}
                        name="turma_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Turma</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a turma" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {turmas.map((turma) => (
                                  <SelectItem key={turma.id} value={turma.id}>
                                    {turma.nome} ({turma.serie})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numero_matricula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Matrícula</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 202400123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {papel === "professor" && (
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000.000.000-00"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                handleCpfChange(e);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            O CPF será usado como senha inicial do professor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="imagem_perfil"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Imagem de Perfil (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            {...fieldProps}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Formatos aceitos: JPG e PNG. Tamanho máximo: 5MB.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/2"
                      onClick={() => setFormStep(0)}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="w-1/2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Cadastrar Usuário"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Todos os campos marcados são obrigatórios para o cadastro
        </CardFooter>
      </Card>
    </div>
  );
}