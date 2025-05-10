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
import { Loader2 } from 'lucide-react';

// Schema de validação para o formulário de perfil
const profileFormSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ManagerProfileProps {
  userId: string;
}

export default function ManagerProfile({ userId }: ManagerProfileProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Carregar dados do perfil
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get(`/api/manager/profile/${userId}`);
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
      const response = await api.put(`/api/manager/profile/${userId}`, data);
      
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
      <div className="flex justify-center items-center p-8 bg-[#1B1B1B] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#A85F16]" />
      </div>
    );
  }

  return (
    <Card className="w-full bg-[#1B1B1B] border border-[#33261B] rounded-sm shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-white text-lg">Meu Perfil</CardTitle>
        <CardDescription className="text-gray-400">
          Visualize e edite as informações do seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-6">
          {/* Informações não editáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">CPF</h3>
              <p className="text-base text-white">{userProfile?.cpf || 'Não informado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Papel no Sistema</h3>
              <p className="text-base text-white capitalize">{userProfile?.papel || 'Não definido'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Data de Criação</h3>
              <p className="text-base text-white">
                {userProfile?.criadoEm 
                  ? new Date(userProfile.criadoEm).toLocaleDateString('pt-BR') 
                  : 'Não informada'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-[#33261B] pt-4 mt-2">
            <h3 className="text-lg font-medium mb-4 text-white">Editar Informações</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          {...field} 
                          className="bg-[#33261B] border-none text-white placeholder:text-gray-400 focus:ring-1 focus:ring-[#A85F16]"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#A85F16] hover:bg-[#A85F16]/80 text-white border-none" 
                  disabled={isSubmitting}
                >
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