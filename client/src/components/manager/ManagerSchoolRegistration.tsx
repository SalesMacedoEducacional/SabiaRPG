import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Schema de validação para o formulário
const schoolFormSchema = z.object({
  nome: z.string().min(3, { message: 'Nome da escola deve ter pelo menos 3 caracteres' }),
  codigo_escola: z.string().min(1, { message: 'Código/INEP da escola é obrigatório' }),
  tipo: z.enum(['estadual', 'municipal', 'particular', 'federal'], {
    required_error: 'Selecione o tipo da escola'
  }),
  modalidade: z.enum([
    'maternal_creche', 'fundamental_i', 'fundamental_ii', 
    'medio', 'medio_tecnico', 'eja', 'outra'
  ], { 
    required_error: 'Selecione a modalidade de ensino' 
  }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Forneça a sigla do estado com 2 letras' }).toUpperCase(),
  zona_geografica: z.enum(['urbana', 'rural'], { 
    required_error: 'Selecione a zona geográfica' 
  }),
  endereco: z.string().min(5, { message: 'Endereço deve ter pelo menos 5 caracteres' }),
  telefone: z.string().min(10, { message: 'Telefone da escola é obrigatório' })
    .refine(val => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(val), {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    }),
  email: z.string().email({ message: 'Email institucional inválido' }).min(5, { message: 'Email é obrigatório' }),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

interface ManagerSchoolRegistrationProps {
  userId: string;
  onSchoolRegistered: (schoolData: any) => void;
}

// Mapa de estados brasileiros e suas cidades
// Interfaces para os dados da API de estados e cidades
interface Estado {
  id: string; // id é a sigla do estado (ex: 'PI')
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export default function ManagerSchoolRegistration({ userId, onSchoolRegistered }: ManagerSchoolRegistrationProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<Cidade[]>([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('');
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [carregandoEstados, setCarregandoEstados] = useState(true);

  // Configurar o formulário com valores padrão
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      nome: '',
      codigo_escola: '',
      cidade: '',
      estado: '',
      tipo: undefined,
      modalidade: undefined,
      zona_geografica: undefined,
      endereco: '',
      telefone: '',
      email: '',
    },
  });

  // Função para formatar o telefone
  const formatarTelefone = (valor: string) => {
    // Remove tudo que não for dígito
    const apenasDigitos = valor.replace(/\D/g, '');
    
    // Formata conforme a quantidade de dígitos
    if (apenasDigitos.length <= 2) {
      return apenasDigitos;
    } else if (apenasDigitos.length <= 7) {
      return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2)}`;
    } else if (apenasDigitos.length <= 11) {
      return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7)}`;
    } else {
      return `(${apenasDigitos.slice(0, 2)}) ${apenasDigitos.slice(2, 7)}-${apenasDigitos.slice(7, 11)}`;
    }
  };

  // Carregar estados do Brasil via API
  useEffect(() => {
    const carregarEstados = async () => {
      try {
        setCarregandoEstados(true);
        const response = await api.get('/api/estados');
        if (response.data && Array.isArray(response.data)) {
          setEstados(response.data);
        } else {
          console.error('Formato de resposta inválido para estados:', response.data);
          toast({
            title: "Erro ao carregar estados",
            description: "Não foi possível carregar a lista de estados.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        toast({
          title: "Erro ao carregar estados",
          description: "Ocorreu um erro ao tentar carregar a lista de estados.",
          variant: "destructive",
        });
      } finally {
        setCarregandoEstados(false);
      }
    };

    carregarEstados();
  }, [form, toast]);

  // Carregar cidades quando o estado mudar
  useEffect(() => {
    const carregarCidades = async () => {
      if (!estadoSelecionado) return;
      
      try {
        setCarregandoCidades(true);
        const response = await api.get(`/api/estados/${estadoSelecionado}/cidades-por-sigla`);
        
        if (response.data && Array.isArray(response.data)) {
          setCidadesDisponiveis(response.data);
        } else {
          console.error('Formato de resposta inválido para cidades:', response.data);
          setCidadesDisponiveis([]);
          toast({
            title: "Erro ao carregar cidades",
            description: "Não foi possível carregar a lista de cidades.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar cidades para o estado ${estadoSelecionado}:`, error);
        setCidadesDisponiveis([]);
        toast({
          title: "Erro ao carregar cidades",
          description: "Ocorreu um erro ao tentar carregar a lista de cidades.",
          variant: "destructive",
        });
      } finally {
        setCarregandoCidades(false);
      }
    };

    carregarCidades();
  }, [estadoSelecionado, toast]);

  // Limpar a cidade selecionada quando o estado mudar
  useEffect(() => {
    form.setValue('cidade', '');
  }, [estadoSelecionado, form]);

  // Monitorar mudanças no campo de estado
  const handleEstadoChange = (valor: string) => {
    setEstadoSelecionado(valor);
    form.setValue('estado', valor);
  };

  // Função para formatar telefone durante digitação
  const handleTelefoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(event.target.value);
    form.setValue('telefone', valorFormatado);
  };

  // Função para submeter o formulário
  const onSubmit = async (data: SchoolFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Mapear os dados do formulário para o formato esperado pelo backend
      const submitData = {
        nome: data.nome,
        codigo_escola: data.codigo_escola,
        tipo: data.tipo,
        modalidade_ensino: data.modalidade,
        cidade: data.cidade,
        estado: data.estado,
        zona_geografica: data.zona_geografica,
        endereco_completo: data.endereco,
        telefone: data.telefone,
        email_institucional: data.email,
        gestor_id: userId,
      };
      
      console.log('Enviando dados para cadastro:', submitData);
      
      // Enviar dados para a API
      const response = await api.post('/api/schools', submitData);
      
      // Mostrar toast de sucesso
      toast({
        title: "Escola cadastrada com sucesso!",
        description: "Sua escola foi registrada e vinculada ao seu perfil.",
        variant: "default",
      });
      
      // Notificar componente pai sobre o sucesso
      onSchoolRegistered(response.data);
    } catch (error: any) {
      console.error('Erro ao cadastrar escola:', error);
      
      // Mostrar mensagem de erro
      toast({
        title: "Erro ao cadastrar escola",
        description: error.response?.data?.message || "Ocorreu um erro ao tentar cadastrar a escola. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full bg-[#231f20] border border-[#3e2a18] rounded-sm shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-white text-lg">Cadastro de Escola</CardTitle>
        <CardDescription className="text-gray-400">
          Preencha os dados abaixo para cadastrar a sua escola. Todos os campos são obrigatórios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nome da Escola</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome completo da escola" 
                        className="bg-[#3e2a18] border-none text-white placeholder:text-gray-400 focus:ring-1 focus:ring-[#a85f16]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codigo_escola"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Código/INEP da Escola</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Código único da escola" 
                        className="bg-dark-dark border-accent placeholder:text-slate-500 text-parchment"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Tipo de Escola</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#3e2a18] border-none text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#231f20] border border-[#3e2a18] text-white">
                        <SelectItem value="estadual">Estadual</SelectItem>
                        <SelectItem value="municipal">Municipal</SelectItem>
                        <SelectItem value="particular">Particular</SelectItem>
                        <SelectItem value="federal">Federal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="modalidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Modalidade de Ensino</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-dark border-accent text-parchment">
                          <SelectValue placeholder="Selecione a modalidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-light border-accent text-parchment">
                        <SelectItem value="maternal_creche">Maternal/Creche</SelectItem>
                        <SelectItem value="fundamental_i">Fundamental I</SelectItem>
                        <SelectItem value="fundamental_ii">Fundamental II</SelectItem>
                        <SelectItem value="medio">Ensino Médio</SelectItem>
                        <SelectItem value="medio_tecnico">Médio-Técnico</SelectItem>
                        <SelectItem value="eja">EJA</SelectItem>
                        <SelectItem value="outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Estado</FormLabel>
                    <Select
                      onValueChange={handleEstadoChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-dark border-accent text-parchment">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-light border-accent text-parchment max-h-56 overflow-y-auto">
                        {carregandoEstados ? (
                          <SelectItem value="carregando" disabled>Carregando...</SelectItem>
                        ) : estados.length > 0 ? (
                          estados.map((estado) => (
                            <SelectItem key={estado.id} value={estado.id}>
                              {estado.sigla} - {estado.nome}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="nenhum" disabled>Nenhum estado disponível</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Cidade</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={carregandoCidades || cidadesDisponiveis.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-dark border-accent text-parchment">
                          <SelectValue placeholder={
                            carregandoCidades 
                              ? "Carregando cidades..." 
                              : cidadesDisponiveis.length === 0 
                                ? "Selecione um estado primeiro" 
                                : "Selecione a cidade"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-light border-accent text-parchment max-h-56 overflow-y-auto">
                        {carregandoCidades ? (
                          <SelectItem value="carregando" disabled>Carregando...</SelectItem>
                        ) : cidadesDisponiveis.length > 0 ? (
                          cidadesDisponiveis.map((cidade) => (
                            <SelectItem key={cidade.id} value={cidade.nome}>
                              {cidade.nome}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="nenhuma" disabled>Nenhuma cidade disponível</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zona_geografica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Zona Geográfica</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-dark border-accent text-parchment">
                          <SelectValue placeholder="Selecione a zona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-light border-accent text-parchment">
                        <SelectItem value="urbana">Urbana</SelectItem>
                        <SelectItem value="rural">Rural</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Telefone da Escola</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        className="bg-dark-dark border-accent placeholder:text-slate-500 text-parchment"
                        value={field.value}
                        onChange={(e) => {
                          handleTelefoneChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Email Institucional</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@escola.edu.br" 
                        className="bg-dark-dark border-accent placeholder:text-slate-500 text-parchment"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-parchment">Endereço Completo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Rua, número, bairro, complemento..." 
                      className="resize-none bg-dark-dark border-accent placeholder:text-slate-500 text-parchment"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-[#a85f16] hover:bg-[#a85f16]/80 text-white border-none" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar Escola'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}