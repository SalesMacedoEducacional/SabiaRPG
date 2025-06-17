import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useStandardToast } from '@/lib/toast-utils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Building2, School, MapPin, FileText } from 'lucide-react';

const schoolRegistrationSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  codigo_escola: z.string().min(4, 'Código deve ter pelo menos 4 caracteres'),
  tipo: z.string().min(1, 'Selecione o tipo da escola'),
  modalidade_ensino: z.string().min(1, 'Selecione a modalidade de ensino'),
  cidade: z.string().min(2, 'Nome da cidade deve ter pelo menos 2 caracteres'),
  estado: z.string().min(2, 'Selecione o estado'),
});

type SchoolRegistrationForm = z.infer<typeof schoolRegistrationSchema>;

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tiposEscola = [
  'Pública Municipal',
  'Pública Estadual',
  'Pública Federal',
  'Privada',
  'Filantrópica'
];

const modalidadesEnsino = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio',
  'Educação de Jovens e Adultos',
  'Ensino Técnico',
  'Educação Especial'
];

export default function ManagerSchoolRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useStandardToast();
  const { verificarEscolasGestor } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<SchoolRegistrationForm>({
    resolver: zodResolver(schoolRegistrationSchema),
    defaultValues: {
      nome: '',
      codigo_escola: '',
      tipo: '',
      modalidade_ensino: '',
      cidade: '',
      estado: '',
    },
  });

  const onSubmit = async (data: SchoolRegistrationForm) => {
    setIsSubmitting(true);
    try {
      console.log('Cadastrando nova escola:', data);
      
      const response = await apiRequest('POST', '/api/escolas/gestor', data);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Escola cadastrada com sucesso:', result);
        
        toast.success('Escola cadastrada com sucesso!');
        
        // Atualizar as escolas vinculadas no contexto
        await verificarEscolasGestor();
        
        // Redirecionar para o dashboard do gestor
        setLocation('/manager');
      } else {
        const errorData = await response.json();
        console.error('Erro ao cadastrar escola:', errorData);
        toast.error(errorData.message || 'Erro ao cadastrar escola');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Cadastro de Escola
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Para acessar o painel do gestor, você precisa cadastrar uma escola.
            Preencha os dados abaixo para vincular sua escola ao sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome da Escola */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Nome da Escola
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Escola Municipal Dom Pedro II"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código da Escola */}
              <FormField
                control={form.control}
                name="codigo_escola"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Código da Escola
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: EM001, CEF123, etc."
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo e Modalidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo da Escola</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposEscola.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
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
                  name="modalidade_ensino"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade de Ensino</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalidadesEnsino.map((modalidade) => (
                            <SelectItem key={modalidade} value={modalidade}>
                              {modalidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Cidade
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: São Paulo"
                          {...field}
                          className="h-11"
                        />
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
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botão de Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Escola'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}