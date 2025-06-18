import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useLocation } from "wouter";

interface Escola {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  codigo_escola: string;
}

interface Turma {
  id: string;
  nome: string;
  serie: string;
  turno: string;
}

// Schema de validação com papel e escola obrigatórios
const userSchema = z.object({
  papel: z.enum(["aluno", "professor", "gestor"], {
    required_error: "Papel é obrigatório",
  }),
  escola_id: z.string().min(1, "Escola é obrigatória"),
  nome_completo: z.string().min(3, "Nome completo é obrigatório (mínimo 3 caracteres)"),
  email: z.string().email("E-mail válido é obrigatório"),
  telefone: z.string().min(14, "Telefone é obrigatório"),
  data_nascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  cpf: z.string().min(14, "CPF é obrigatório"),
  senha: z.string().min(6, "Senha é obrigatória (mínimo 6 caracteres)"),
  // Campos condicionais para alunos
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
    message: "Para alunos: turma e número de matrícula são obrigatórios",
    path: ["turma_id"],
  }
);

type UserFormData = z.infer<typeof userSchema>;

export default function UserRegistrationSimple() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      papel: undefined,
      escola_id: "",
      nome_completo: "",
      email: "",
      telefone: "",
      cpf: "",
      senha: "",
      turma_id: "",
      numero_matricula: "",
    },
  });

  const papel = form.watch("papel");
  const escolaId = form.watch("escola_id");

  // Carregar escolas
  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        console.log('Carregando escolas para cadastro...');
        const response = await fetch('/api/escolas-cadastro');
        const data = await response.json();
        
        if (data.sucesso) {
          setEscolas(data.escolas);
          console.log(`${data.escolas.length} escolas carregadas`);
        }
      } catch (error) {
        console.error("Erro ao carregar escolas:", error);
        toast({
          title: "Erro ao carregar escolas",
          description: "Não foi possível carregar a lista de escolas.",
          variant: "destructive",
        });
      }
    };

    fetchEscolas();
  }, [toast]);

  // Carregar turmas quando escola e papel aluno selecionados
  useEffect(() => {
    const fetchTurmas = async () => {
      if (papel === 'aluno' && escolaId) {
        try {
          console.log(`Carregando turmas para escola: ${escolaId}`);
          const response = await fetch(`/api/turmas-por-escola/${escolaId}`);
          const data = await response.json();
          
          if (data.sucesso) {
            setTurmas(data.turmas);
            console.log(`${data.turmas.length} turmas carregadas`);
          }
        } catch (error) {
          console.error("Erro ao carregar turmas:", error);
          setTurmas([]);
        }
      } else {
        setTurmas([]);
      }
    };

    fetchTurmas();
  }, [papel, escolaId]);

  // Máscaras
  const formatPhone = (value: string) => {
    let phone = value.replace(/\D/g, "");
    if (phone.length > 11) phone = phone.slice(0, 11);
    
    if (phone.length <= 10) {
      phone = phone.replace(/^(\d{2})(\d)/g, "($1) $2");
      phone = phone.replace(/(\d)(\d{4})$/, "$1-$2");
    } else {
      phone = phone.replace(/^(\d{2})(\d)/g, "($1) $2");
      phone = phone.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    
    return phone;
  };

  const formatCPF = (value: string) => {
    let cpf = value.replace(/\D/g, "");
    if (cpf.length > 11) cpf = cpf.slice(0, 11);
    
    cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    cpf = cpf.replace(/\.(\d{3})(\d)/, ".$1-$2");
    
    return cpf;
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('Enviando dados do usuário:', data);
      
      const response = await fetch('/api/cadastrar-usuario-direto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.sucesso) {
        toast({
          title: "Usuário cadastrado com sucesso!",
          description: `${data.nome_completo} foi cadastrado como ${data.papel}.`,
        });
        
        // Reset form
        form.reset();
        setTurmas([]);
        
        // Redirect to user management
        setTimeout(() => {
          setLocation('/manager/users');
        }, 1500);
      } else {
        throw new Error(result.erro || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível cadastrar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-primary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-dark border border-primary/40 rounded-lg shadow-xl">
        <div className="p-6 border-b border-primary/40">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/manager/users')}
              className="text-parchment hover:bg-dark-light"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-accent" />
              <h1 className="text-2xl font-bold text-parchment">Cadastrar Novo Usuário</h1>
            </div>
          </div>
          <p className="text-parchment-dark mt-2">
            Preencha os dados do novo usuário da plataforma SABI RPG
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            
            {/* PAPEL - PRIMEIRO CAMPO */}
            <FormField
              control={form.control}
              name="papel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-parchment font-medium">Papel do Usuário *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-primary bg-dark text-parchment focus:ring-accent">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark border border-primary text-parchment">
                      <SelectItem value="aluno" className="focus:bg-dark-light focus:text-parchment">Aluno</SelectItem>
                      <SelectItem value="professor" className="focus:bg-dark-light focus:text-parchment">Professor</SelectItem>
                      <SelectItem value="gestor" className="focus:bg-dark-light focus:text-parchment">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-parchment-dark">
                    O papel determina as permissões do usuário na plataforma
                  </FormDescription>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            {/* ESCOLA - SEGUNDO CAMPO OBRIGATÓRIO */}
            <FormField
              control={form.control}
              name="escola_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-parchment font-medium">Escola *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-primary bg-dark text-parchment focus:ring-accent">
                        <SelectValue placeholder="Selecione a escola" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark border border-primary text-parchment">
                      {escolas.map((escola) => (
                        <SelectItem 
                          key={escola.id} 
                          value={escola.id}
                          className="focus:bg-dark-light focus:text-parchment"
                        >
                          {escola.nome} - {escola.cidade}/{escola.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-parchment-dark">
                    Todos os usuários devem estar vinculados a uma escola
                  </FormDescription>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            {/* DADOS PESSOAIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment font-medium">Nome Completo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Maria Silva Santos" 
                        {...field} 
                        className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment font-medium">E-mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Ex: maria.silva@escola.edu.br"
                        {...field}
                        className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment font-medium">Telefone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(99) 99999-9999"
                        value={field.value}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          field.onChange(formatted);
                        }}
                        className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment font-medium">CPF *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123.456.789-00" 
                        value={field.value}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value);
                          field.onChange(formatted);
                        }}
                        className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-parchment font-medium">Data de Nascimento *</FormLabel>
                    <FormControl>
                      <EnhancedDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="dd/mm/aaaa"
                        maxDate={new Date()}
                        disabled={(date: Date) => date > new Date()}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment font-medium">Senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        {...field}
                        className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            {/* CAMPOS ESPECÍFICOS PARA ALUNOS */}
            {papel === "aluno" && (
              <div className="border-t border-primary/40 pt-4">
                <h3 className="text-lg font-semibold text-parchment mb-4">Dados do Aluno</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="turma_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-parchment font-medium">Turma *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!escolaId}
                        >
                          <FormControl>
                            <SelectTrigger className="border-primary bg-dark text-parchment focus:ring-accent">
                              <SelectValue 
                                placeholder={
                                  !escolaId 
                                    ? "Primeiro selecione uma escola" 
                                    : turmas.length === 0 
                                      ? "Carregando turmas..." 
                                      : "Selecione a turma"
                                } 
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark border border-primary text-parchment">
                            {turmas.map((turma) => (
                              <SelectItem 
                                key={turma.id} 
                                value={turma.id} 
                                className="focus:bg-dark-light focus:text-parchment"
                              >
                                {turma.nome} - {turma.serie} ({turma.turno})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-parchment-dark">
                          {!escolaId && "Selecione uma escola primeiro"}
                        </FormDescription>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero_matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-parchment font-medium">Número de Matrícula *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 202400123" 
                            {...field} 
                            className="border-primary bg-dark text-parchment placeholder:text-parchment-dark focus:border-accent focus:ring-accent"
                          />
                        </FormControl>
                        <FormMessage className="text-destructive" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* BOTÃO DE SUBMIT */}
            <div className="pt-4 border-t border-primary/40">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cadastrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Cadastrar Usuário
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}