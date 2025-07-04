import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useStandardToast } from "@/lib/toast-utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

// Componentes do shadcn
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, School, BookCopy } from "lucide-react";

// Schema de validação para o formulário
const turmaSchema = z.object({
  nome_turma: z.string()
    .min(3, "O nome da turma deve ter pelo menos 3 caracteres")
    .max(100, "O nome da turma não pode exceder 100 caracteres"),
  turno: z.enum(["Manhã", "Tarde", "Noite", "Integral"], {
    required_error: "Selecione o turno da turma",
  }),
  serie: z.string()
    .min(2, "Informe a série da turma")
    .max(50, "A série não pode exceder 50 caracteres"),
  modalidade: z.string()
    .min(2, "Informe a modalidade de ensino")
    .max(50, "A modalidade não pode exceder 50 caracteres"),
  ano_letivo: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= new Date().getFullYear(), {
      message: "O ano letivo deve ser o ano atual ou futuro",
    }),
  quantidade_maxima_alunos: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "A quantidade de alunos deve ser um número positivo",
    })
    .transform((val) => (val ? Number(val) : undefined)),
  observacoes: z.string().optional(),
  escola_id: z.string().min(1, "Escola é obrigatória"),
});

// Tipo inferido do schema
type TurmaFormValues = z.infer<typeof turmaSchema>;

export default function ClassRegistration() {
  const toast = useStandardToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // Buscar as escolas do gestor
  const { data: escolas, isLoading: isLoadingEscolas } = useQuery({
    queryKey: ['/api/escolas/gestor'],
    enabled: !!user && user.role === 'manager',
  });

  // Form com react-hook-form e zod
  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      nome_turma: "",
      turno: undefined,
      serie: "",
      modalidade: "",
      ano_letivo: currentYear.toString(),
      quantidade_maxima_alunos: "",
      observacoes: "",
      escola_id: "",
    },
  });

  // Definir a escola automaticamente se só houver uma
  useEffect(() => {
    if (escolas && escolas.length === 1 && !form.getValues().escola_id) {
      form.setValue("escola_id", escolas[0].id);
    }
  }, [escolas, form]);

  // Função para verificar se o nome da turma já existe
  const verificarNomeTurma = async (nome: string, ano: string, escolaId: string) => {
    try {
      const res = await apiRequest(
        "GET", 
        `/api/turmas/verificar-nome?nome_turma=${encodeURIComponent(nome)}&ano_letivo=${ano}&escola_id=${escolaId}`
      );
      const data = await res.json();
      return data.disponivel;
    } catch (error) {
      console.error("Erro ao verificar nome da turma:", error);
      return false;
    }
  };

  // Função para cadastrar a turma
  const onSubmit = async (data: TurmaFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Validação adicional: garantir que escola foi selecionada
      if (!data.escola_id || data.escola_id.trim() === "") {
        toast.error("Escola obrigatória", "Você deve selecionar uma escola antes de cadastrar a turma");
        setIsSubmitting(false);
        return;
      }

      // Verificar se a escola existe nas escolas do gestor
      const escolaValida = escolas?.find(escola => escola.id === data.escola_id);
      if (!escolaValida) {
        toast({
          title: "Escola inválida",
          description: "A escola selecionada não é válida ou você não tem permissão para cadastrar turmas nela",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Verifica se o nome da turma já existe para esta escola e ano letivo
      const nomeDisponivel = await verificarNomeTurma(
        data.nome_turma,
        data.ano_letivo,
        data.escola_id
      );
      
      if (!nomeDisponivel) {
        toast({
          title: "Nome já utilizado",
          description: "Já existe uma turma com este nome para este ano letivo nesta escola",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Preparar dados para enviar ao backend (mapear nome_turma para nome)
      const dadosParaEnvio = {
        nome: data.nome_turma,
        turno: data.turno,
        serie: data.serie,
        modalidade: data.modalidade,
        ano_letivo: data.ano_letivo,
        descricao: data.observacoes || null,
        escola_id: data.escola_id
      };
      
      // Fazer requisição para cadastrar a turma
      const response = await apiRequest("POST", "/api/turmas", dadosParaEnvio);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar turma");
      }
      
      // Limpar o cache de turmas
      queryClient.invalidateQueries({ queryKey: ['/api/turmas'] });
      
      // Exibir mensagem de sucesso
      toast.classCreated(data.nome_turma, escolaValida.nome);
      
      // Redirecionar para a lista de turmas
      setLocation("/manager/classes");
    } catch (error) {
      console.error("Erro ao cadastrar turma:", error);
      toast({
        title: "Erro ao cadastrar turma",
        description: error instanceof Error ? error.message : "Erro desconhecido ao cadastrar turma",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se não for gestor ou admin, redirecionar para o dashboard
  if (user && user.role !== 'manager' && user.role !== 'admin') {
    setLocation("/manager");
    return null;
  }

  return (
    <div className="sabia-bg">
      <div className="sabia-decorative-corner top-left"></div>
      <div className="sabia-decorative-corner top-right"></div>
      <div className="sabia-decorative-corner bottom-left"></div>
      <div className="sabia-decorative-corner bottom-right"></div>
      <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/manager")}
            className="bg-[#4a4639] border border-[#D47C06] text-white hover:bg-[#57533f] flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Dashboard
          </Button>
          <h1 className="text-2xl font-bold ml-2">Cadastro de Nova Turma</h1>
        </div>
      </div>

      <Card className="sabia-content-area">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookCopy className="h-5 w-5 text-primary" />
            <CardTitle>Formulário de Cadastro de Turma</CardTitle>
          </div>
          <CardDescription>
            Preencha as informações para cadastrar uma nova turma
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Escola */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center mb-4">
                  <School className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-medium">Escola</h3>
                </div>
                <FormField
                  control={form.control}
                  name="escola_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-500">Escola *</FormLabel>
                      <Select
                        disabled={isLoadingEscolas}
                        onValueChange={field.onChange}
                        value={field.value}
                        required
                      >
                        <FormControl>
                          <SelectTrigger className={`${!field.value ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="⚠️ Selecione uma escola (obrigatório)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {escolas && escolas.length > 0 ? (
                            escolas.map((escola: any) => (
                              <SelectItem key={escola.id} value={escola.id}>
                                {escola.nome}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              Nenhuma escola encontrada
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-orange-600">
                        <strong>OBRIGATÓRIO:</strong> A turma será vinculada à escola selecionada. Esta seleção não pode ser alterada após o cadastro.
                      </FormDescription>
                      {!field.value && (
                        <div className="text-red-500 text-sm mt-1">
                          ⚠️ Você deve selecionar uma escola para continuar
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Dados da Turma */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <h3 className="text-lg font-medium mb-4">Dados da Turma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome_turma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Turma *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 2º Ano A" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome ou identificação da turma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="turno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turno *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o turno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Manhã">Manhã</SelectItem>
                            <SelectItem value="Tarde">Tarde</SelectItem>
                            <SelectItem value="Noite">Noite</SelectItem>
                            <SelectItem value="Integral">Integral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Período em que a turma terá aulas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Série *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1º Ano, 2º Ano, 3º Ano" {...field} />
                        </FormControl>
                        <FormDescription>
                          Série ou ano da turma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modalidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ensino Médio, Técnico, EJA" {...field} />
                        </FormControl>
                        <FormDescription>
                          Modalidade de ensino da turma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ano_letivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano Letivo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ano letivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={currentYear.toString()}>
                              {currentYear}
                            </SelectItem>
                            <SelectItem value={nextYear.toString()}>
                              {nextYear}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Ano letivo da turma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantidade_maxima_alunos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade Máxima de Alunos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 30"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Capacidade máxima de alunos na turma (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais sobre a turma (opcional)"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Informações adicionais sobre a turma (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Aviso quando nenhuma escola estiver selecionada */}
              {!form.watch("escola_id") && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex items-center">
                    <div className="text-red-600 text-sm">
                      <strong>⚠️ Atenção:</strong> Você deve selecionar uma escola antes de cadastrar a turma. 
                      O vínculo entre turma e escola é obrigatório e não pode ser alterado posteriormente.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/manager")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.watch("escola_id")}
                  className={!form.watch("escola_id") ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : !form.watch("escola_id") ? (
                    "Selecione uma escola primeiro"
                  ) : (
                    "Cadastrar Turma"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="border-t bg-muted/20 flex justify-between">
          <p className="text-sm text-muted-foreground">
            * Campos obrigatórios
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}