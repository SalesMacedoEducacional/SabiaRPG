import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

// Schema de validação para o formulário
const formSchema = z.object({
  email: z.string().email("Digite um email válido"),
  password: z.string().min(11, "Senha deve ter pelo menos 11 dígitos").max(14, "Senha inválida"),
  papel: z.enum(["gestor", "professor", "aluno"], {
    required_error: "Selecione um papel",
  }),
  cpf: z.string().min(11, "CPF deve ter pelo menos 11 dígitos").max(14, "CPF inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TesteCadastroSimplificado() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resultadoCriacao, setResultadoCriacao] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      papel: "gestor",
      cpf: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setResultadoCriacao(null);

    try {
      // Chamar API para criar usuário
      const response = await axios.post('/cadastrar-usuario', data);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${data.email} criado com papel de ${data.papel}`,
      });

      setResultadoCriacao(response.data);
      form.reset();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      let mensagemErro = "Ocorreu um erro durante a criação do usuário";
      if (axios.isAxiosError(error) && error.response) {
        // Exibir mensagem de erro do servidor se disponível
        mensagemErro = error.response.data.error || mensagemErro;
      }

      toast({
        variant: "destructive",
        title: "Falha ao criar usuário",
        description: mensagemErro,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro Simplificado de Usuário</CardTitle>
            <CardDescription>
              Crie um usuário no sistema usando o novo endpoint simplificado.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="usuario@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha (ou CPF como senha)</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use o CPF como senha inicial (apenas números)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="papel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gestor">Gestor</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="aluno">Aluno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando usuário..." : "Criar Usuário"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          {resultadoCriacao && (
            <CardFooter className="flex flex-col items-start border-t p-4">
              <h3 className="font-semibold text-lg mb-2">Resultado da criação:</h3>
              <div className="bg-muted p-3 rounded-md w-full overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(resultadoCriacao, null, 2)}
                </pre>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}