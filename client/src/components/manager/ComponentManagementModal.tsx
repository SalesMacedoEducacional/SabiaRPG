import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Palette } from "lucide-react";

interface ComponentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  turmaId: string;
  turmaNome: string;
  turmaAno: string;
}

export default function ComponentManagementModal({
  isOpen,
  onClose,
  turmaId,
  turmaNome,
  turmaAno
}: ComponentManagementModalProps) {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Componentes padrão baseados no ano da turma
  const componentesPadrao = [
    { id: '1', nome: 'Linguagens e suas Tecnologias', cor_hex: '#4DA3A9', ano_serie: turmaAno },
    { id: '2', nome: 'Matemática e suas Tecnologias', cor_hex: '#D4A054', ano_serie: turmaAno },
    { id: '3', nome: 'Ciências da Natureza', cor_hex: '#A6E3E9', ano_serie: turmaAno },
    { id: '4', nome: 'Ciências Humanas e Sociais Aplicadas', cor_hex: '#FFC23C', ano_serie: turmaAno },
    { id: '5', nome: 'Arte e Educação Física', cor_hex: '#312E26', ano_serie: turmaAno }
  ];

  const handleComponentToggle = (componenteId: string) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(componenteId)) {
      newSelected.delete(componenteId);
    } else {
      newSelected.add(componenteId);
    }
    setSelectedComponents(newSelected);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const componentesData = Array.from(selectedComponents).map(componenteId => ({
        componenteId,
        professorId: null
      }));

      const response = await fetch(`/api/turmas/${turmaId}/componentes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ componentes: componentesData })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Componentes atualizados com sucesso!",
        });
        onClose();
      } else {
        throw new Error('Erro ao salvar componentes');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar componentes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Gerenciar Componentes - {turmaNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Selecione os componentes curriculares para a turma <strong>{turmaNome}</strong> ({turmaAno})
          </div>

          <ScrollArea className="max-h-96 pr-4">
            <div className="space-y-4">
              {componentesPadrao.map((componente) => (
                <div key={componente.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette 
                      className="h-4 w-4" 
                      style={{ color: componente.cor_hex }}
                    />
                    <h3 className="font-medium text-gray-900">{componente.nome}</h3>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: componente.cor_hex,
                        color: componente.cor_hex
                      }}
                    >
                      {turmaAno}
                    </Badge>
                  </div>

                  <div className="ml-7 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={componente.id}
                        checked={selectedComponents.has(componente.id)}
                        onCheckedChange={() => handleComponentToggle(componente.id)}
                      />
                      <label
                        htmlFor={componente.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {componente.nome} - {componente.ano_serie}
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedComponents.size} componente(s) selecionado(s)
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Componentes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}