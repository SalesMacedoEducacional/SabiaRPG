import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useStandardToast } from '@/lib/toast-utils';
import { Loader2, Plus, BookOpen, Calendar } from 'lucide-react';

interface Turma {
  id: string;
  nome_turma: string;
  serie: string;
  turno: string;
}

interface ComponenteCurricular {
  turma_componente_id: string;
  componente: string;
  professor: string;
  ano_serie: string;
}

interface Componente {
  id: string;
  nome: string;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
}

interface PlanoAula {
  id: string;
  titulo: string;
  conteudo: string;
  data_aula: string;
  created_at: string;
}

export default function ComponentesCurriculares() {
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isPlanoModalOpen, setIsPlanoModalOpen] = useState(false);
  const [isAddComponentModalOpen, setIsAddComponentModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [selectedTurmaComponenteId, setSelectedTurmaComponenteId] = useState<string>('');
  const [novoPlano, setNovoPlano] = useState({ titulo: '', conteudo: '', data_aula: '' });
  const [novoComponente, setNovoComponente] = useState({ 
    componente_id: '', 
    professor_id: '', 
    ano_serie: '' 
  });

  const queryClient = useQueryClient();

  // Query para buscar turmas do gestor
  const { data: turmas, isLoading: isLoadingTurmas } = useQuery({
    queryKey: ['/api/turmas'],
    enabled: isMainModalOpen
  });

  // Query para buscar componentes da turma selecionada
  const { data: componentes, isLoading: isLoadingComponentes, refetch: refetchComponentes } = useQuery({
    queryKey: ['/api/turmas', selectedTurma?.id, 'componentes'],
    queryFn: async () => {
      if (!selectedTurma) return [];
      const response = await apiRequest('GET', `/api/turmas/${selectedTurma.id}/componentes`);
      return response.json();
    },
    enabled: !!selectedTurma && isComponentModalOpen
  });

  // Query para buscar planos de aula
  const { data: planosAula, isLoading: isLoadingPlanos, refetch: refetchPlanos } = useQuery({
    queryKey: ['/api/turma_componentes', selectedTurmaComponenteId, 'planos_aula'],
    queryFn: async () => {
      if (!selectedTurmaComponenteId) return [];
      const response = await apiRequest('GET', `/api/turma_componentes/${selectedTurmaComponenteId}/planos_aula`);
      return response.json();
    },
    enabled: !!selectedTurmaComponenteId && isPlanoModalOpen
  });

  // Query para buscar todos os componentes
  const { data: todosComponentes, isLoading: isLoadingTodosComponentes } = useQuery({
    queryKey: ['/api/componentes'],
    enabled: isAddComponentModalOpen
  });

  // Query para buscar professores
  const { data: professoresData, isLoading: isLoadingProfessores } = useQuery({
    queryKey: ['/api/professores'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/professores');
      return response.json();
    },
    enabled: isAddComponentModalOpen
  });

  // Mutation para criar plano de aula
  const createPlanoMutation = useMutation({
    mutationFn: async (planoData: any) => {
      const response = await apiRequest('POST', '/api/plano_aula', planoData);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Plano de aula criado com sucesso!');
      setNovoPlano({ titulo: '', conteudo: '', data_aula: '' });
      refetchPlanos();
    },
    onError: (error: any) => {
      toast.error('Erro ao criar plano de aula', error.message);
    }
  });

  // Mutation para adicionar componente à turma
  const addComponenteMutation = useMutation({
    mutationFn: async (componenteData: any) => {
      const response = await apiRequest('POST', '/api/turma_componentes', componenteData);
      return response.json();
    },
    onSuccess: () => {
      toast.success('Componente adicionado com sucesso!');
      setNovoComponente({ componente_id: '', professor_id: '', ano_serie: '' });
      setIsAddComponentModalOpen(false);
      refetchComponentes();
    },
    onError: (error: any) => {
      toast.error('Erro ao adicionar componente', error.message);
    }
  });

  const handleTurmaSelect = (turma: Turma) => {
    setSelectedTurma(turma);
    setIsMainModalOpen(false);
    setIsComponentModalOpen(true);
  };

  // Listener para eventos customizados da tela de turmas
  useEffect(() => {
    const handleOpenComponentsModal = (event: CustomEvent) => {
      const turmaData = event.detail;
      handleTurmaSelect(turmaData);
    };

    document.addEventListener('openComponentsModal', handleOpenComponentsModal as EventListener);
    
    return () => {
      document.removeEventListener('openComponentsModal', handleOpenComponentsModal as EventListener);
    };
  }, []);

  const handlePlanosAulaClick = (turmaComponenteId: string) => {
    setSelectedTurmaComponenteId(turmaComponenteId);
    setIsComponentModalOpen(false);
    setIsPlanoModalOpen(true);
  };

  const handleCreatePlano = () => {
    if (!novoPlano.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    createPlanoMutation.mutate({
      turma_componente_id: selectedTurmaComponenteId,
      titulo: novoPlano.titulo,
      conteudo: novoPlano.conteudo,
      data_aula: novoPlano.data_aula || null
    });
  };

  const handleAddComponente = () => {
    if (!novoComponente.componente_id || !novoComponente.professor_id || !novoComponente.ano_serie) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    addComponenteMutation.mutate({
      turma_id: selectedTurma?.id,
      componente_id: novoComponente.componente_id,
      professor_id: novoComponente.professor_id,
      ano_serie: novoComponente.ano_serie
    });
  };

  return (
    <>
      <Dialog open={isMainModalOpen} onOpenChange={setIsMainModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Gerenciar Componentes Curriculares
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Turma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingTurmas ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-3">
                {turmas?.map((turma: Turma) => (
                  <Card 
                    key={turma.id} 
                    className="cursor-pointer hover:bg-gray-50 border-2 hover:border-blue-300 transition-colors"
                    onClick={() => handleTurmaSelect(turma)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{turma.nome_turma}</CardTitle>
                      <CardDescription>
                        {turma.serie} - {turma.turno}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Componentes da Turma */}
      <Dialog open={isComponentModalOpen} onOpenChange={setIsComponentModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Componentes Curriculares - {selectedTurma?.nome_turma}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button 
                onClick={() => setIsAddComponentModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Componente
              </Button>
            </div>

            {isLoadingComponentes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Componente</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Ano/Série</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {componentes?.map((componente: ComponenteCurricular) => (
                    <TableRow key={componente.turma_componente_id}>
                      <TableCell>{componente.componente}</TableCell>
                      <TableCell>{componente.professor}</TableCell>
                      <TableCell>{componente.ano_serie}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePlanosAulaClick(componente.turma_componente_id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Planos de Aula
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Planos de Aula */}
      <Dialog open={isPlanoModalOpen} onOpenChange={setIsPlanoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Planos de Aula</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Formulário para novo plano */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Novo Plano de Aula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={novoPlano.titulo}
                    onChange={(e) => setNovoPlano({...novoPlano, titulo: e.target.value})}
                    placeholder="Título do plano de aula"
                  />
                </div>
                <div>
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    value={novoPlano.conteudo}
                    onChange={(e) => setNovoPlano({...novoPlano, conteudo: e.target.value})}
                    placeholder="Descrição do conteúdo da aula"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="data_aula">Data da Aula</Label>
                  <Input
                    id="data_aula"
                    type="date"
                    value={novoPlano.data_aula}
                    onChange={(e) => setNovoPlano({...novoPlano, data_aula: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleCreatePlano}
                  disabled={createPlanoMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createPlanoMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar Plano
                </Button>
              </CardContent>
            </Card>

            {/* Lista de planos existentes */}
            {isLoadingPlanos ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {planosAula?.map((plano: PlanoAula) => (
                  <Card key={plano.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{plano.titulo}</CardTitle>
                      <CardDescription>
                        {plano.data_aula && `Data: ${new Date(plano.data_aula).toLocaleDateString('pt-BR')}`}
                        {plano.created_at && ` | Criado em: ${new Date(plano.created_at).toLocaleDateString('pt-BR')}`}
                      </CardDescription>
                    </CardHeader>
                    {plano.conteudo && (
                      <CardContent>
                        <p className="text-sm text-gray-700">{plano.conteudo}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar Componente */}
      <Dialog open={isAddComponentModalOpen} onOpenChange={setIsAddComponentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Componente Curricular</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="componente">Componente</Label>
              <Select value={novoComponente.componente_id} onValueChange={(value) => 
                setNovoComponente({...novoComponente, componente_id: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o componente" />
                </SelectTrigger>
                <SelectContent>
                  {todosComponentes?.map((comp: Componente) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="professor">Professor</Label>
              <Select value={novoComponente.professor_id} onValueChange={(value) => 
                setNovoComponente({...novoComponente, professor_id: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o professor" />
                </SelectTrigger>
                <SelectContent>
                  {professoresData?.professores?.map((prof: Professor) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano_serie">Ano/Série</Label>
              <Input
                id="ano_serie"
                value={novoComponente.ano_serie}
                onChange={(e) => setNovoComponente({...novoComponente, ano_serie: e.target.value})}
                placeholder="Ex: 1º Ano, 2º Ano, etc."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAddComponentModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddComponente}
                disabled={addComponenteMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {addComponenteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}