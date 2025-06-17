import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Schema de validação
const userSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  papel: z.enum(["aluno", "professor", "gestor"], {
    required_error: "Papel é obrigatório",
  }),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  turma_id: z.string().optional(),
  numero_matricula: z.string().optional(),
  escola_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface Turma {
  id: string;
  nome: string;
  serie: string;
}

export default function UserRegistrationSingle() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { refreshAfterCreate, resetForm } = useAutoRefresh();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Formulário com validação
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
    defaultValues: {
      nome_completo: "",
      email: "",
      telefone: "",
      papel: undefined,
      cpf: "",
      senha: "",
      turma_id: "",
      numero_matricula: "",
      escola_id: "",
    },
  });

  // Observar campos para validação em tempo real
  const watchedFields = form.watch();
  
  // Validação do formulário
  const isFormValid = () => {
    const values = form.getValues();
    
    const basicFieldsValid = !!(values.nome_completo?.trim() && 
                               values.email?.trim() && 
                               values.telefone?.trim() && 
                               values.data_nascimento && 
                               values.papel && 
                               values.cpf?.trim() && 
                               values.senha?.trim());
    
    if (values.papel === "aluno") {
      return basicFieldsValid && !!(values.turma_id?.trim() && values.numero_matricula?.trim()) && !isSubmitting;
    }
    
    return basicFieldsValid && !isSubmitting;
  };

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar turmas
        const turmasResponse = await apiRequest("GET", "/api/turmas");
        if (turmasResponse.ok) {
          const turmasData = await turmasResponse.json();
          setTurmas(Array.isArray(turmasData) ? turmasData : []);
        }

        // Carregar escolas
        const escolasResponse = await apiRequest("GET", "/api/escolas/todas");
        if (escolasResponse.ok) {
          const escolasData = await escolasResponse.json();
          setEscolas(Array.isArray(escolasData) ? escolasData : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar algumas informações necessárias.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [toast]);

  // Aplicar máscaras
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    } else {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    
    form.setValue("telefone", value);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    
    form.setValue("cpf", value);
  };

  // Submissão do formulário
  const onSubmit = async (data: UserFormData) => {
    if (!isFormValid()) {
      toast({
        title: "Formulário incompleto",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {      
      const payload = {
        nome_completo: data.nome_completo,
        email: data.email,
        telefone: data.telefone,
        data_nascimento: data.data_nascimento?.toISOString().split('T')[0],
        papel: data.papel,
        cpf: data.cpf,
        senha: data.senha,
        ...(data.papel === "aluno" && {
          turma_id: data.turma_id,
          numero_matricula: data.numero_matricula,
        }),
      };
      
      const response = await apiRequest("POST", "/api/usuarios", payload);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ erro: "Erro desconhecido" }));
        throw new Error(errorData.erro || errorData.message || "Erro ao cadastrar usuário");
      }
      
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `${data.nome_completo} foi adicionado ao sistema.`,
        variant: "default",
      });
      
      // Reset do formulário
      resetForm(() => {
        form.reset({
          nome_completo: "",
          email: "",
          telefone: "",
          papel: undefined,
          cpf: "",
          senha: "",
          turma_id: "",
          numero_matricula: "",
          escola_id: "",
        });
        setSelectedDate(undefined);
      });
      
      await refreshAfterCreate("usuário");
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Erro ao processar cadastro";
      let errors: string[] = [];
      
      if (error?.response?.data?.conflitos) {
        errors = error.response.data.conflitos;
        errorMessage = "Dados já cadastrados no sistema";
        setValidationErrors(errors);
      } else if (error?.response?.data?.erro) {
        errorMessage = error.response.data.erro;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao cadastrar usuário",
        description: errorMessage,
        variant: "destructive",
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar permissão de acesso
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
      <div className="mb-8 border-b border-primary/40 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-parchment font-medieval">CADASTRO DE USUÁRIOS</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/manager")}
            className="border-primary text-parchment hover:bg-dark-light"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      <Card className="w-full border border-primary shadow-md bg-dark-light">
        <CardHeader className="space-y-1 border-b border-primary/60 bg-dark">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-dark p-3 rounded-full border border-accent">
              <UserPlus className="h-10 w-10 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-parchment font-medieval">Cadastrar Novo Usuário</CardTitle>
          <CardDescription className="text-center text-parchment-dark">
            Preencha os dados do novo usuário para cadastrá-lo na plataforma SABIÁ RPG
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4 p-6">
          {/* Exibir erros de validação */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 border border-red-400 rounded-md bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-red-800 font-semibold">Dados já cadastrados</h3>
              </div>
              <ul className="text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm">
                      <FormLabel className="text-parchment font-medium">Nome Completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome completo" 
                          {...field}
                          className="border-primary bg-dark text-parchment focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm">
                      <FormLabel className="text-parchment font-medium">Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="exemplo@email.com" 
                          {...field}
                          className="border-primary bg-dark text-parchment focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                {/* Telefone */}
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm">
                      <FormLabel className="text-parchment font-medium">Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(99) 99999-9999" 
                          {...field}
                          onChange={handlePhoneChange}
                          className="border-primary bg-dark text-parchment focus:ring-accent"
                        />
                      </FormControl>
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  )}
                />

                {/* CPF */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#312e26] font-semibold">CPF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00" 
                          {...field}
                          className="border-[#8c7851] focus:border-[#d4a054]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de Nascimento */}
                <FormField
                  control={form.control}
                  name="data_nascimento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[#312e26] font-semibold">Data de Nascimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-[#8c7851]",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Papel */}
                <FormField
                  control={form.control}
                  name="papel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#312e26] font-semibold">Papel</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#8c7851] focus:border-[#d4a054]">
                            <SelectValue placeholder="Selecione o papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aluno">Aluno</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="gestor">Gestor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campos específicos para aluno */}
              {form.watch("papel") === "aluno" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#d4a054]/20 rounded-lg border border-[#d4a054]">
                  <h3 className="col-span-full text-lg font-semibold text-[#312e26] mb-2">
                    Informações do Aluno
                  </h3>
                  
                  {/* Turma */}
                  <FormField
                    control={form.control}
                    name="turma_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#312e26] font-semibold">Turma</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-[#8c7851] focus:border-[#d4a054]">
                              <SelectValue placeholder="Selecione a turma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {turmas.map((turma) => (
                              <SelectItem key={turma.id} value={turma.id}>
                                {turma.nome} - {turma.serie}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Número de Matrícula */}
                  <FormField
                    control={form.control}
                    name="numero_matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#312e26] font-semibold">Número de Matrícula</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite o número de matrícula" 
                            {...field}
                            className="border-[#8c7851] focus:border-[#d4a054]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Senha */}
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#312e26] font-semibold">Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Digite a senha" 
                        {...field}
                        className="border-[#8c7851] focus:border-[#d4a054]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mensagens de erro */}
              {validationErrors.length > 0 && (
                <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Erros encontrados:</h4>
                  <ul className="list-disc list-inside text-red-700">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botão de submit */}
              <div className="flex justify-center pt-6">
                <Button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full max-w-md bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}