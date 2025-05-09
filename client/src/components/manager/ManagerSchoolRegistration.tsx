import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { School } from 'lucide-react';

// Schema para validação do formulário
const schoolFormSchema = z.object({
  nome: z.string().min(3, { message: 'Nome da escola é obrigatório (mínimo 3 caracteres)' }),
  endereco: z.string().min(5, { message: 'Endereço é obrigatório (mínimo 5 caracteres)' }),
  cidade: z.string().min(2, { message: 'Cidade é obrigatória' }),
  estado: z.string().length(2, { message: 'Estado inválido (use sigla de 2 letras)' }),
  cep: z.string().min(8, { message: 'CEP inválido' }).max(9, { message: 'CEP inválido' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }).optional(),
  email: z.string().email({ message: 'Email inválido' }).optional(),
  tipo: z.string({ required_error: 'Tipo de escola é obrigatório' }),
  nivelEnsino: z.string({ required_error: 'Nível de ensino é obrigatório' }),
  descricao: z.string().optional()
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

interface ManagerSchoolRegistrationProps {
  userId: string;
  onSchoolRegistered?: () => void;
}

const ManagerSchoolRegistration: React.FC<ManagerSchoolRegistrationProps> = ({ 
  userId,
  onSchoolRegistered
}) => {
  const { toast } = useToast();
  
  // Configuração do formulário
  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      nome: '',
      endereco: '',
      cidade: '',
      estado: 'PI',
      cep: '',
      telefone: '',
      email: '',
      tipo: '',
      nivelEnsino: '',
      descricao: ''
    }
  });
  
  // Mutation para cadastro de escola
  const registerSchoolMutation = useMutation({
    mutationFn: async (data: SchoolFormValues) => {
      const response = await axios.post('/api/escolas/cadastrar', {
        ...data,
        gestorId: userId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/info'] });
      toast({
        title: 'Escola cadastrada com sucesso!',
        description: 'A escola foi registrada e vinculada ao seu perfil.',
        variant: 'default',
      });
      
      if (onSchoolRegistered) {
        onSchoolRegistered();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao cadastrar escola',
        description: error.response?.data?.message || 'Ocorreu um erro ao cadastrar a escola. Tente novamente.',
        variant: 'destructive',
      });
    }
  });
  
  // Função para submeter o formulário
  const onSubmit = (data: SchoolFormValues) => {
    registerSchoolMutation.mutate(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl">Cadastro de Escola</CardTitle>
        </div>
        <CardDescription>
          Preencha os dados da escola que você gerencia. 
          Estes dados serão utilizados para vincular sua conta de gestor à instituição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Escola *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escola Municipal João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Escola *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de escola" />
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
              
              <FormField
                control={form.control}
                name="nivelEnsino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Ensino *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível de ensino" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="infantil">Educação Infantil</SelectItem>
                        <SelectItem value="fundamental1">Ensino Fundamental I</SelectItem>
                        <SelectItem value="fundamental2">Ensino Fundamental II</SelectItem>
                        <SelectItem value="medio">Ensino Médio</SelectItem>
                        <SelectItem value="eja">EJA</SelectItem>
                        <SelectItem value="tecnico">Ensino Técnico</SelectItem>
                        <SelectItem value="superior">Ensino Superior</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Rua das Flores, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Teresina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PI" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 64000-000" {...field} />
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
                      <Input placeholder="Ex: (86) 99999-9999" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: escola@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais sobre a escola..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={registerSchoolMutation.isPending}
              >
                {registerSchoolMutation.isPending ? 'Cadastrando...' : 'Cadastrar Escola'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ManagerSchoolRegistration;