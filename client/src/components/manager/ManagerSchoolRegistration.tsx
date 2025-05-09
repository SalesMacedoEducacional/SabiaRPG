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
type CidadesPorEstado = Record<string, string[]>;

export default function ManagerSchoolRegistration({ userId, onSchoolRegistered }: ManagerSchoolRegistrationProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cidadesPorEstado, setCidadesPorEstado] = useState<CidadesPorEstado>({});
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>('PI');
  const [carregandoCidades, setCarregandoCidades] = useState(false);

  // Configurar o formulário com valores padrão
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      nome: '',
      codigo_escola: '',
      cidade: '',
      estado: 'PI',
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

  // Carregar cidades para o estado de Piauí (PI) - como exemplo
  // Em um ambiente real, carregaríamos de uma API ou banco de dados
  useEffect(() => {
    const carregarCidadesPiaui = () => {
      setCidadesPorEstado({
        PI: [
          'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 
          'Campo Maior', 'Barras', 'Pedro II', 'União', 'Altos',
          'Oeiras', 'São Raimundo Nonato', 'Esperantina', 'José de Freitas', 
          'Paulistana', 'Batalha', 'Água Branca', 'Amarante', 'Valença do Piauí',
          'Luís Correia', 'Cocal', 'Uruçuí', 'Regeneração', 'Simplício Mendes',
          'Corrente', 'Elesbão Veloso', 'Miguel Alves', 'Luzilândia', 'Canto do Buriti',
          'Bom Jesus', 'Fronteiras', 'Guadalupe', 'Piracuruca', 'Jaicós'
        ]
      });
    };

    const carregarCidadesBrasil = () => {
      // Este é um conjunto limitado de cidades principais por estado 
      // Em uma aplicação real, você usaria uma API ou banco de dados com o conjunto completo
      return {
        AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó'],
        AL: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo', 'Penedo'],
        AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
        AP: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão'],
        BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
        CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
        DF: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Plano Piloto'],
        ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim'],
        GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
        MA: ['São Luís', 'Imperatriz', 'Timon', 'Caxias', 'Codó'],
        MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
        MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
        MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
        PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal'],
        PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
        PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
        PI: [
          'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano', 
          'Campo Maior', 'Barras', 'Pedro II', 'União', 'Altos',
          'Oeiras', 'São Raimundo Nonato', 'Esperantina', 'José de Freitas', 
          'Paulistana', 'Batalha', 'Água Branca', 'Amarante', 'Valença do Piauí',
          'Luís Correia', 'Cocal', 'Uruçuí', 'Regeneração', 'Simplício Mendes'
        ],
        PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
        RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
        RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
        RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
        RR: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre', 'Mucajaí'],
        RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
        SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó'],
        SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão'],
        SP: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André'],
        TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins']
      };
    };
    
    setCidadesPorEstado(carregarCidadesBrasil());

    // Inicializar cidades de Piauí (estado padrão)
    const cidadesPiaui = carregarCidadesBrasil().PI || [];
    setCidadesDisponiveis(cidadesPiaui);
  }, []);

  // Atualizar cidades disponíveis quando o estado mudar
  useEffect(() => {
    if (estadoSelecionado) {
      setCarregandoCidades(true);
      // Simular um pequeno delay para mostrar o carregamento (em produção seria a chamada API)
      setTimeout(() => {
        const cidades = cidadesPorEstado[estadoSelecionado] || [];
        setCidadesDisponiveis(cidades);
        setCarregandoCidades(false);
      }, 300);
    }
  }, [estadoSelecionado, cidadesPorEstado]);

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
    <Card className="w-full bg-dark-light border-primary">
      <CardHeader>
        <CardTitle className="text-accent font-medieval">Cadastro de Escola</CardTitle>
        <CardDescription className="text-parchment-dark">
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
                    <FormLabel className="text-parchment">Nome da Escola</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome completo da escola" 
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
                    <FormLabel className="text-parchment">Tipo de Escola</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark-dark border-accent text-parchment">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-light border-accent text-parchment">
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
                      <SelectContent className="bg-dark-light border-accent text-parchment">
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="AL">AL</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="BA">BA</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                        <SelectItem value="DF">DF</SelectItem>
                        <SelectItem value="ES">ES</SelectItem>
                        <SelectItem value="GO">GO</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                        <SelectItem value="MT">MT</SelectItem>
                        <SelectItem value="MS">MS</SelectItem>
                        <SelectItem value="MG">MG</SelectItem>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="PB">PB</SelectItem>
                        <SelectItem value="PR">PR</SelectItem>
                        <SelectItem value="PE">PE</SelectItem>
                        <SelectItem value="PI">PI</SelectItem>
                        <SelectItem value="RJ">RJ</SelectItem>
                        <SelectItem value="RN">RN</SelectItem>
                        <SelectItem value="RS">RS</SelectItem>
                        <SelectItem value="RO">RO</SelectItem>
                        <SelectItem value="RR">RR</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="SP">SP</SelectItem>
                        <SelectItem value="SE">SE</SelectItem>
                        <SelectItem value="TO">TO</SelectItem>
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
                        {cidadesDisponiveis.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>
                            {cidade}
                          </SelectItem>
                        ))}
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
              className="w-full bg-accent hover:bg-accent/90 text-dark font-bold hover:text-dark-dark" 
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