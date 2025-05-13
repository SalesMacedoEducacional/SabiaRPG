import React, { useState, useEffect } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ClassRegistrationFormProps {
  escolaId: string;
  turmaId: string | null;
  onSave: (turma: any) => void;
  onCancel: () => void;
}

// Schema para validação do formulário
const turmaFormSchema = z.object({
  nome: z.string().min(1, "Nome da turma é obrigatório"),
  serie: z.string().min(1, "Série é obrigatória"),
  turno: z.string().min(1, "Turno é obrigatório"),
  modalidade: z.string().min(1, "Modalidade de ensino é obrigatória"),
  ano_letivo: z.coerce.number().min(2023, "Ano letivo deve ser 2023 ou posterior"),
  descricao: z.string().optional(),
  escola_id: z.string().min(1, "Escola é obrigatória"),
});

type TurmaFormValues = z.infer<typeof turmaFormSchema>;

export default function ClassRegistrationForm({ 
  escolaId, 
  turmaId, 
  onSave, 
  onCancel 
}: ClassRegistrationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Configuração do formulário com valores padrão
  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaFormSchema),
    defaultValues: {
      nome: "",
      serie: "",
      turno: "",
      modalidade: "Ensino Fundamental II",
      ano_letivo: new Date().getFullYear(),
      descricao: "",
      escola_id: escolaId,
    },
  });

  // Carregar dados da turma para edição
  useEffect(() => {
    if (turmaId) {
      const fetchTurma = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`/api/turmas/${turmaId}`);
          if (response.data) {
            const turma = response.data;
            // Preencher formulário com valores da turma
            form.reset({
              nome: turma.nome,
              serie: turma.serie,
              turno: turma.turno,
              modalidade: turma.modalidade,
              ano_letivo: turma.ano_letivo,
              descricao: turma.descricao || "",
              escola_id: turma.escola_id,
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados da turma:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da turma",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTurma();
    } else {
      // Se for nova turma, apenas garantir que o escola_id está preenchido
      form.setValue("escola_id", escolaId);
    }
  }, [turmaId, escolaId, form, toast]);

  // Enviar formulário
  const onSubmit = async (values: TurmaFormValues) => {
    try {
      setIsLoading(true);
      
      // Verificar primeiro se o nome da turma já existe para a mesma escola/ano
      const verificarResponse = await axios.get('/api/turmas/verificar-nome', {
        params: {
          nome: values.nome,
          ano_letivo: values.ano_letivo,
          escola_id: values.escola_id
        }
      });
      
      // Se não estiver disponível e não for a mesma turma sendo editada
      if (!verificarResponse.data.disponivel && 
          !(turmaId && verificarResponse.data.id === turmaId)) {
        toast({
          title: "Aviso",
          description: "Já existe uma turma com este nome para este ano letivo na escola selecionada",
          variant: "destructive",
        });
        return;
      }
      
      let response;
      
      if (turmaId) {
        // Atualizar turma existente
        response = await axios.put(`/api/turmas/${turmaId}`, values);
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso",
        });
      } else {
        // Criar nova turma
        response = await axios.post("/api/turmas", values);
        toast({
          title: "Sucesso",
          description: "Turma cadastrada com sucesso",
        });
      }
      
      if (response && response.data) {
        onSave(response.data);
      }
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados da turma",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo oculto do ID da escola */}
        <FormField
          control={form.control}
          name="escola_id"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Nome da Turma */}
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-parchment">Nome da Turma</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ex: 7º Ano A" 
                  className="bg-dark-light border-primary text-parchment"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-parchment-dark text-xs">
                Digite o nome completo da turma, incluindo o ano e a identificação.
              </FormDescription>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        {/* Série */}
        <FormField
          control={form.control}
          name="serie"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-parchment">Série</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ex: 7º Ano" 
                  className="bg-dark-light border-primary text-parchment"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-destructive" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ano Letivo */}
          <FormField
            control={form.control}
            name="ano_letivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-parchment">Ano Letivo</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={2023} 
                    max={2050} 
                    className="bg-dark-light border-primary text-parchment"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {/* Descrição */}
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-parchment">Descrição/Observações</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Observações sobre a turma (opcional)"
                    className="bg-dark-light border-primary text-parchment"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Turno */}
          <FormField
            control={form.control}
            name="turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-parchment">Turno</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-dark-light border-primary text-parchment">
                      <SelectValue placeholder="Selecione o turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-dark border-primary">
                    <SelectItem value="Manhã" className="text-parchment hover:bg-dark-light">Manhã</SelectItem>
                    <SelectItem value="Tarde" className="text-parchment hover:bg-dark-light">Tarde</SelectItem>
                    <SelectItem value="Noite" className="text-parchment hover:bg-dark-light">Noite</SelectItem>
                    <SelectItem value="Integral" className="text-parchment hover:bg-dark-light">Integral</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />

          {/* Modalidade */}
          <FormField
            control={form.control}
            name="modalidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-parchment">Modalidade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="bg-dark-light border-primary text-parchment">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-dark border-primary">
                    <SelectItem value="Ensino Fundamental I" className="text-parchment hover:bg-dark-light">Ensino Fundamental I</SelectItem>
                    <SelectItem value="Ensino Fundamental II" className="text-parchment hover:bg-dark-light">Ensino Fundamental II</SelectItem>
                    <SelectItem value="Ensino Médio" className="text-parchment hover:bg-dark-light">Ensino Médio</SelectItem>
                    <SelectItem value="EJA" className="text-parchment hover:bg-dark-light">EJA</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
            className="border-primary text-parchment hover:bg-dark-light"
          >
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-accent hover:bg-accent-dark text-white border border-primary"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              <span>{turmaId ? 'Atualizar Turma' : 'Cadastrar Turma'}</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}