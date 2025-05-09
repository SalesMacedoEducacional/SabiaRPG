import React, { useState } from 'react';
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
  telefone: z.string().min(10, { message: 'Telefone da escola é obrigatório' }),
  email: z.string().email({ message: 'Email institucional inválido' }).min(5, { message: 'Email é obrigatório' }),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

interface ManagerSchoolRegistrationProps {
  userId: string;
  onSchoolRegistered: (schoolData: any) => void;
}

export default function ManagerSchoolRegistration({ userId, onSchoolRegistered }: ManagerSchoolRegistrationProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                        {...field} 
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input 
                        placeholder="Nome da cidade" 
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
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-parchment">Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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