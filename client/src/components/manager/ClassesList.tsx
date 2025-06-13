import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Turma {
  id: string;
  nome: string;
  serie?: string;
  ano_letivo?: number;
  ativo: boolean;
  escola_id: string;
  escola_nome?: string;
  total_alunos?: number;
}

interface Escola {
  id: string;
  nome: string;
}

const turmaSchema = z.object({
  nome: z.string().min(1, "Nome da turma é obrigatório"),
  escola_id: z.string().min(1, "Escola é obrigatória - vínculo obrigatório"),
  serie: z.string().optional(),
  ano_letivo: z.number().min(2020).max(2030).optional(),
});

type TurmaForm = z.infer<typeof turmaSchema>;

export default function ClassesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEscola, setSelectedEscola] = useState<string>("");
  const [selectedSerie, setSelectedSerie] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTurma, setEditTurma] = useState<Turma | null>(null);
  const [turmaToDelete, setTurmaToDelete] = useState<Turma | null>(null);

  const series = ["6º ano", "7º ano", "8º ano", "9º ano", "1º ano", "2º ano", "3º ano"];

  // React Query para buscar turmas reais
  const { data: turmasData, isLoading, refetch } = useQuery({
    queryKey: ['turmas-gestor'],
    queryFn: () => fetch('/api/turmas-gestor-real').then(res => res.json()),
  });

  // React Query para buscar escolas
  const { data: escolasData } = useQuery({
    queryKey: ['/api/escolas/gestor'],
    queryFn: () => apiRequest('GET', '/api/escolas/gestor').then(res => res.json()),
  });

  // Forms para criar e editar turmas
  const createForm = useForm<TurmaForm>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      nome: "",
      escola_id: "",
      serie: "",
      ano_letivo: new Date().getFullYear(),
    },
  });

  const editForm = useForm<TurmaForm>({
    resolver: zodResolver(turmaSchema),
  });

  // Mutation para criar turma
  const createTurmaMutation = useMutation({
    mutationFn: async (data: TurmaForm) => {
      const response = await fetch('/api/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar turma');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas-gestor'] });
      setShowCreateDialog(false);
      createForm.reset();
      toast({ title: "Sucesso", description: "Turma criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao criar turma", variant: "destructive" });
    },
  });

  // Mutation para editar turma
  const editTurmaMutation = useMutation({
    mutationFn: async (data: { id: string; turmaData: TurmaForm }) => {
      const response = await fetch(`/api/turmas/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.turmaData),
      });
      if (!response.ok) throw new Error('Erro ao atualizar turma');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas-gestor'] });
      setShowEditDialog(false);
      setEditTurma(null);
      toast({ title: "Sucesso", description: "Turma atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao atualizar turma", variant: "destructive" });
    },
  });

  // Mutation para excluir turma
  const deleteTurmaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/turmas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir turma');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas-gestor'] });
      setShowDeleteDialog(false);
      setTurmaToDelete(null);
      toast({ title: "Sucesso", description: "Turma excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao excluir turma", variant: "destructive" });
    },
  });

  const turmas = turmasData?.turmas || [];
  const escolas = Array.isArray(escolasData) ? escolasData : [];

  // Filtro para mostrar apenas turmas da escola selecionada
  const turmasFiltradas = turmas.filter((turma: Turma) => {
    const escolaMatch = !selectedEscola || turma.escola_id === selectedEscola;
    const serieMatch = !selectedSerie || turma.serie === selectedSerie;
    return escolaMatch && serieMatch;
  });

  const handleCreateTurma = (data: TurmaForm) => {
    createTurmaMutation.mutate(data);
  };

  const handleEditTurma = (turma: Turma) => {
    setEditTurma(turma);
    editForm.reset({
      nome: turma.nome,
      escola_id: turma.escola_id,
      serie: turma.serie || "",
      ano_letivo: turma.ano_letivo || new Date().getFullYear(),
    });
    setShowEditDialog(true);
  };

  const handleDeleteTurma = (turma: Turma) => {
    setTurmaToDelete(turma);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (turmaToDelete) {
      deleteTurmaMutation.mutate(turmaToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-accent" size={24} />
            Gerenciamento de Turmas
          </h1>
          <p className="text-white/70">
            Gerencie turmas com vínculo obrigatório às escolas
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/80 text-primary">
              <Plus size={16} className="mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#312e26] border-[#D47C06] text-white">
            <DialogHeader>
              <DialogTitle className="text-primary">Nova Turma</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateTurma)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Turma</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#4a4639] border-[#D47C06] text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="escola_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escola (Obrigatório)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                            <SelectValue placeholder="Selecione uma escola" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {escolas.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                              {escola.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Série</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                            <SelectValue placeholder="Selecione uma série" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {series.map((serie) => (
                            <SelectItem key={serie} value={serie}>
                              {serie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createTurmaMutation.isPending}>
                    {createTurmaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Turma
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{turmas.length}</p>
              <p className="text-white/70">Total de Turmas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{escolas.length}</p>
              <p className="text-white/70">Escolas Vinculadas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2520] border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{turmasFiltradas.length}</p>
              <p className="text-white/70">Turmas Filtradas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={selectedEscola} onValueChange={setSelectedEscola}>
          <SelectTrigger className="w-full md:w-64 bg-[#2a2520] border-primary/20 text-white">
            <SelectValue placeholder="Filtrar por escola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as escolas</SelectItem>
            {escolas.map((escola) => (
              <SelectItem key={escola.id} value={escola.id}>
                {escola.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSerie} onValueChange={setSelectedSerie}>
          <SelectTrigger className="w-full md:w-48 bg-[#2a2520] border-primary/20 text-white">
            <SelectValue placeholder="Filtrar por série" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as séries</SelectItem>
            {series.map((serie) => (
              <SelectItem key={serie} value={serie}>
                {serie}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Turmas */}
      <Card className="bg-[#2a2520] border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">
            Lista de Turmas ({turmasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-primary/20">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20 hover:bg-primary/5">
                  <TableHead className="text-white">Nome da Turma</TableHead>
                  <TableHead className="text-white">Escola</TableHead>
                  <TableHead className="text-white">Série</TableHead>
                  <TableHead className="text-white">Total Alunos</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmasFiltradas.length > 0 ? (
                  turmasFiltradas.map((turma) => (
                    <TableRow key={turma.id} className="border-primary/20 hover:bg-primary/5">
                      <TableCell className="text-white font-medium">{turma.nome}</TableCell>
                      <TableCell className="text-white">{turma.escola_nome}</TableCell>
                      <TableCell className="text-white">{turma.serie || "Não informado"}</TableCell>
                      <TableCell className="text-white">{turma.total_alunos || 0}</TableCell>
                      <TableCell>
                        <Badge variant={turma.ativo ? "default" : "secondary"} className="bg-green-600">
                          {turma.ativo ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTurma(turma)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTurma(turma)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-white/50">
                      {selectedEscola || selectedSerie ? "Nenhuma turma encontrada com os filtros aplicados" : "Nenhuma turma cadastrada"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-primary">Editar Turma</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => editTurmaMutation.mutate({ id: editTurma!.id, turmaData: data }))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Turma</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-[#4a4639] border-[#D47C06] text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="escola_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escola (Obrigatório)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#4a4639] border-[#D47C06] text-white">
                          <SelectValue placeholder="Selecione uma escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {escolas.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id}>
                            {escola.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={editTurmaMutation.isPending}>
                  {editTurmaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#312e26] border-[#D47C06] text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">
              Tem certeza que deseja excluir a turma <span className="font-bold text-accent">"{turmaToDelete?.nome}"</span>?
            </p>
            <p className="text-red-400 text-sm mt-2">
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteTurmaMutation.isPending}
            >
              {deleteTurmaMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir Turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}