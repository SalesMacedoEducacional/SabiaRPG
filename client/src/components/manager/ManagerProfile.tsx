import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { User, Loader2 } from 'lucide-react';

// Schema para validação do formulário
const profileFormSchema = z.object({
  nome: z.string().min(3, { message: 'Nome é obrigatório (mínimo 3 caracteres)' }),
  email: z.string().email({ message: 'Email inválido' }),
  cpf: z.string().min(11, { message: 'CPF inválido' }).max(14, { message: 'CPF inválido' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }).optional().nullable(),
  dataNascimento: z.string().optional().nullable(),
  perfilFotoUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ManagerProfileProps {
  userId: string;
}

const ManagerProfile: React.FC<ManagerProfileProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Buscar informações do perfil do gestor
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/profile', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/profile/${userId}`);
      return response.data;
    },
    enabled: !!userId
  });
  
  // Configuração do formulário
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      dataNascimento: '',
      perfilFotoUrl: '',
      bio: ''
    }
  });
  
  // Atualizar formulário quando os dados do perfil forem carregados
  useEffect(() => {
    if (profileData) {
      form.reset({
        nome: profileData.nome || '',
        email: profileData.email || '',
        cpf: profileData.cpf || '',
        telefone: profileData.telefone || '',
        dataNascimento: profileData.dataNascimento ? new Date(profileData.dataNascimento).toISOString().split('T')[0] : '',
        perfilFotoUrl: profileData.perfilFotoUrl || '',
        bio: profileData.bio || ''
      });
      setIsLoading(false);
    }
  }, [profileData, form]);
  
  // Mutation para atualização do perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const response = await axios.put(`/api/profile/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile', userId] });
      toast({
        title: 'Perfil atualizado com sucesso!',
        description: 'Suas informações foram atualizadas.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.response?.data?.message || 'Ocorreu um erro ao atualizar o perfil. Tente novamente.',
        variant: 'destructive',
      });
    }
  });
  
  // Função para submeter o formulário
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  if (isLoading || isProfileLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-500">Carregando perfil...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl">Meu Perfil</CardTitle>
        </div>
        <CardDescription>
          Visualize e atualize suas informações pessoais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              {profileData?.perfilFotoUrl ? (
                <AvatarImage src={profileData.perfilFotoUrl} alt="Foto de perfil" />
              ) : (
                <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                  {profileData?.nome?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'GS'}
                </AvatarFallback>
              )}
            </Avatar>
            <Button variant="outline" size="sm" disabled>
              Alterar foto
            </Button>
            <div className="text-center">
              <h3 className="font-medium">{profileData?.nome || 'Gestor'}</h3>
              <p className="text-sm text-gray-500">Gestor Escolar</p>
            </div>
          </div>
          
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu CPF" disabled {...field} />
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
                          <Input placeholder="(99) 99999-9999" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="perfilFotoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Foto de Perfil</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="URL da imagem (opcional)" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Conte um pouco sobre você..." 
                          className="min-h-[100px]"
                          {...field} 
                          value={field.value || ''} 
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
                    onClick={() => form.reset()}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerProfile;