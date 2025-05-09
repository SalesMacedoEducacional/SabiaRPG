import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
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
import { Loader2 } from 'lucide-react';

// Schema de validação para o formulário de perfil
const profileFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ManagerProfileProps {
  userId: string;
}

export function ManagerProfile({ userId }: ManagerProfileProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Carregar dados do perfil
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`/api/manager/profile/${userId}`);
        setUserProfile(response.data);
        
        // Preencher formulário com dados existentes
        form.reset({
          email: response.data.email || '',
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar os dados do seu perfil.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, toast]);

  // Configurar o formulário
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: '',
    },
  });

  // Função para submeter o formulário
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Enviar dados para a API
      const response = await axios.put(`/api/manager/profile/${userId}`, data);
      
      // Atualizar dados do perfil local
      setUserProfile({
        ...userProfile,
        ...response.data.user,
      });
      
      // Mostrar toast de sucesso
      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram atualizadas.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      // Mostrar mensagem de erro
      toast({
        title: "Erro ao atualizar perfil",
        description: error.response?.data?.message || "Ocorreu um erro ao tentar atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>
          Visualize e edite as informações do seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Informações não editáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">CPF</h3>
              <p className="text-base">{userProfile?.cpf || 'Não informado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Papel no Sistema</h3>
              <p className="text-base capitalize">{userProfile?.papel || 'Não definido'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Criação</h3>
              <p className="text-base">
                {userProfile?.criadoEm 
                  ? new Date(userProfile.criadoEm).toLocaleDateString('pt-BR') 
                  : 'Não informada'}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4 mt-2">
            <h3 className="text-lg font-medium mb-4">Editar Informações</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}