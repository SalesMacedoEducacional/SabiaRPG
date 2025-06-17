import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
        if (turmasResponse) {
          setTurmas(Array.isArray(turmasResponse) ? turmasResponse : []);
        }

        // Carregar escolas
        const escolasResponse = await apiRequest("GET", "/api/escolas/todas");
        if (escolasResponse) {
          setEscolas(Array.isArray(escolasResponse) ? escolasResponse : []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, []);

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
    
    try {
      console.log("Dados do formulário:", data);
      
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

      console.log("Enviando payload:", payload);
      
      const response = await apiRequest("POST", "/api/usuarios", payload);
      
      // Sucesso
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
      
      // Refresh automático
      await refreshAfterCreate("usuário");
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      setValidationErrors([]);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#312e26] via-[#3c3830] to-[#8c7851] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#f5e6cb] rounded-lg shadow-xl p-8 border-2 border-[#d4a054]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#312e26] mb-2">
              Cadastro de Novo Usuário
            </h1>
            <p className="text-[#8c7851]">
              Preencha todos os campos para criar um novo usuário no sistema
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#312e26] font-semibold">Nome Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome completo" 
                          {...field}
                          className="border-[#8c7851] focus:border-[#d4a054]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#312e26] font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="exemplo@email.com" 
                          {...field}
                          className="border-[#8c7851] focus:border-[#d4a054]"
                        />
                      </FormControl>
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
                      <FormLabel className="text-[#312e26] font-semibold">Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(99) 99999-9999" 
                          {...field}
                          className="border-[#8c7851] focus:border-[#d4a054]"
                        />
                      </FormControl>
                      <FormMessage />
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
                  className="w-full max-w-md bg-[#8c7851] hover:bg-[#d4a054] text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Usuário"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}