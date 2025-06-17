import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

// Componentes UI
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
import { Loader2, UserPlus, Calendar, Check, X, AlertCircle } from "lucide-react";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";

// Interfaces
interface Turma {
  id: string;
  nome: string;
  serie: string;
}

// Schema de validação completo
const userSchema = z.object({
  nome_completo: z.string().min(3, "Nome completo é obrigatório (mínimo 3 caracteres)"),
  email: z.string().email("E-mail válido é obrigatório"),
  telefone: z.string().min(14, "Telefone é obrigatório"),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  papel: z.enum(["aluno", "professor", "gestor"], {
    required_error: "Papel é obrigatório",
  }),
  cpf: z.string().min(14, "CPF é obrigatório"),
  senha: z.string().min(6, "Senha é obrigatória (mínimo 6 caracteres)"),
  // Campos condicionais
  turma_id: z.string().optional(),
  numero_matricula: z.string().optional(),
}).refine(
  (data) => {
    if (data.papel === "aluno") {
      return data.turma_id && data.numero_matricula;
    }
    return true;
  },
  {
    message: "Turma e número de matrícula são obrigatórios para alunos",
    path: ["turma_id"],
  }
);

type UserFormData = z.infer<typeof userSchema>;

export default function UserRegistration() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { refreshAfterCreate, resetForm } = useAutoRefresh();
  
  // Estados do componente
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Estados de validação de unicidade
  const [unicityValidation, setUnicityValidation] = useState({
    cpf: { valid: false, checking: false, error: '', checked: false },
    email: { valid: false, checking: false, error: '', checked: false },
    telefone: { valid: false, checking: false, error: '', checked: false }
  });

  // Formulário com validação
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      nome_completo: "",
      email: "",
      telefone: "",
      papel: undefined,
      cpf: "",
      senha: "",
      turma_id: "",
      numero_matricula: "",
    },
  });

  const papel = form.watch("papel");

  // Função para validar unicidade de um campo
  const validateUnicity = async (campo: keyof typeof unicityValidation, valor: string) => {
    if (!valor || valor.trim() === '') {
      setUnicityValidation(prev => ({
        ...prev,
        [campo]: { valid: false, checking: false, error: '', checked: false }
      }));
      return;
    }
    
    // Marcar como checando
    setUnicityValidation(prev => ({
      ...prev,
      [campo]: { ...prev[campo], checking: true, error: '' }
    }));
    
    try {
      const response = await apiRequest('POST', '/api/usuarios/verificar-unicidade', {
        campo,
        valor: valor.trim()
      });
      
      const { disponivel } = response as any;
      
      setUnicityValidation(prev => ({
        ...prev,
        [campo]: { 
          valid: disponivel, 
          checking: false, 
          error: disponivel ? '' : `${campo.toUpperCase()} já cadastrado no sistema`,
          checked: true
        }
      }));
      
    } catch (error) {
      console.error('Erro na validação de unicidade:', error);
      setUnicityValidation(prev => ({
        ...prev,
        [campo]: { 
          valid: false, 
          checking: false, 
          error: 'Erro ao verificar disponibilidade',
          checked: true
        }
      }));
    }
  };

  // Validação completa do formulário
  const isFormValid = () => {
    const values = form.getValues();
    
    // Validar campos básicos obrigatórios
    const basicFieldsValid = !!(values.nome_completo?.trim() && 
                               values.email?.trim() && 
                               values.telefone?.trim() && 
                               values.data_nascimento && 
                               values.papel && 
                               values.cpf?.trim() && 
                               values.senha?.trim());
    
    // Validar unicidade dos campos críticos - apenas se foram checados
    const unicityValid = (!unicityValidation.cpf.checked || unicityValidation.cpf.valid) && 
                        (!unicityValidation.email.checked || unicityValidation.email.valid) && 
                        (!unicityValidation.telefone.checked || unicityValidation.telefone.valid);
    
    // Validar campos específicos por papel
    let roleSpecificValid = true;
    if (values.papel === "aluno") {
      roleSpecificValid = !!(values.turma_id?.trim() && values.numero_matricula?.trim());
    }
    
    return basicFieldsValid && unicityValid && roleSpecificValid && !isSubmitting;
  };

  // Carregar turmas disponíveis
  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        const response = await apiRequest('GET', '/api/turmas');
        setTurmas(response as any);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };

    fetchTurmas();
  }, []);

  // Função para aplicar máscara de telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      value = value.replace(/^(\d{2})(\d)/, "($1) $2");
      value = value.replace(/(\d{5})(\d)/, "$1-$2");
    }
    
    form.setValue("telefone", value);
    
    // Validar unicidade após delay
    if (value.length >= 14) {
      setTimeout(() => validateUnicity('telefone', value), 800);
    }
  };

  // Função para aplicar máscara de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    
    form.setValue("cpf", value);
    
    // Validar unicidade após delay
    if (value.length >= 14) {
      setTimeout(() => validateUnicity('cpf', value), 800);
    }
  };

  // Validar email ao sair do campo
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && email.includes('@')) {
      validateUnicity('email', email);
    }
  };

  // Função de submissão
  const onSubmit = async (data: UserFormData) => {
    console.log("=== SUBMISSÃO INICIADA ===");
    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      // Payload completo
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
          numero_matricula: data.numero_matricula
        })
      };

      console.log("Enviando dados:", payload);

      const response = await apiRequest('POST', '/api/usuarios', payload);
      console.log("Resposta da API:", response);

      // Sucesso
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `${data.nome_completo} foi adicionado ao sistema.`,
        variant: "default",
      });
      
      // Limpeza completa do formulário
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
        });
        
        // Reset validações de unicidade
        setUnicityValidation({
          cpf: { valid: false, checking: false, error: '', checked: false },
          email: { valid: false, checking: false, error: '', checked: false },
          telefone: { valid: false, checking: false, error: '', checked: false }
        });
      });
      
      // Refresh automático
      await refreshAfterCreate("usuário");
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Erro ao processar cadastro";
      let errors: string[] = [];
      
      // Verificar se é erro de validação de unicidade
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

  // Componente para ícone de validação
  const ValidationIcon = ({ field }: { field: keyof typeof unicityValidation }) => {
    const state = unicityValidation[field];
    
    if (state.checking) {
      return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
    }
    if (state.valid && state.checked) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (!state.valid && state.checked && state.error) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen py-10">
      {/* Cabeçalho */}
      <div className="mb-8 border-b border-primary/40 pb-4">
        <h1 className="text-3xl font-bold mb-2 text-parchment font-medieval">CADASTRO DE USUÁRIOS</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation("/manager")}
            className="border-primary text-parchment hover:bg-dark-light"
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>

      {/* Card principal */}
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
          {/* Exibir erros de validação de unicidade */}
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
              {/* Seção: Dados Pessoais */}
              <div className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-parchment mb-4">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <FormField
                    control={form.control}
                    name="nome_completo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-parchment font-medium">Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite o nome completo"
                            className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark"
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
                        <FormLabel className="text-parchment font-medium">E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="email"
                              placeholder="usuario@exemplo.com"
                              className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark pr-10"
                              onBlur={handleEmailBlur}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <ValidationIcon field="email" />
                            </div>
                          </div>
                        </FormControl>
                        {unicityValidation.email.error && (
                          <p className="text-sm text-red-600">{unicityValidation.email.error}</p>
                        )}
                        {unicityValidation.email.valid && unicityValidation.email.checked && (
                          <p className="text-sm text-green-600">E-mail disponível</p>
                        )}
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
                        <FormLabel className="text-parchment font-medium">Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="(00) 00000-0000"
                              className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark pr-10"
                              onChange={handleTelefoneChange}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <ValidationIcon field="telefone" />
                            </div>
                          </div>
                        </FormControl>
                        {unicityValidation.telefone.error && (
                          <p className="text-sm text-red-600">{unicityValidation.telefone.error}</p>
                        )}
                        {unicityValidation.telefone.valid && unicityValidation.telefone.checked && (
                          <p className="text-sm text-green-600">Telefone disponível</p>
                        )}
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
                        <FormLabel className="text-parchment font-medium">CPF</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="000.000.000-00"
                              className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark pr-10"
                              onChange={handleCpfChange}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <ValidationIcon field="cpf" />
                            </div>
                          </div>
                        </FormControl>
                        {unicityValidation.cpf.error && (
                          <p className="text-sm text-red-600">{unicityValidation.cpf.error}</p>
                        )}
                        {unicityValidation.cpf.valid && unicityValidation.cpf.checked && (
                          <p className="text-sm text-green-600">CPF disponível</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Data de Nascimento */}
                  <FormField
                    control={form.control}
                    name="data_nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-parchment font-medium">Data de Nascimento</FormLabel>
                        <FormControl>
                          <EnhancedDatePicker
                            selectedDate={field.value}
                            onDateChange={field.onChange}
                            placeholder="Selecione a data"
                            className="bg-dark-light border-primary/60 text-parchment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seção: Dados do Sistema */}
              <div className="border border-primary/40 rounded-md p-4 bg-dark shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-parchment mb-4">Dados do Sistema</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Perfil */}
                  <FormField
                    control={form.control}
                    name="papel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-parchment font-medium">Perfil do Usuário</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-light border-primary/60 text-parchment">
                              <SelectValue placeholder="Selecione o perfil" />
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

                  {/* Senha */}
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-parchment font-medium">Senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Digite a senha"
                            className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campos específicos para aluno */}
                  {papel === "aluno" && (
                    <>
                      <FormField
                        control={form.control}
                        name="turma_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-parchment font-medium">Turma</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-dark-light border-primary/60 text-parchment">
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

                      <FormField
                        control={form.control}
                        name="numero_matricula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-parchment font-medium">Número de Matrícula</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Digite o número da matrícula"
                                className="bg-dark-light border-primary/60 text-parchment placeholder:text-parchment-dark"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="w-full md:w-auto px-8 bg-accent hover:bg-accent-dark text-white border border-primary shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Cadastrar Usuário
                    </>
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