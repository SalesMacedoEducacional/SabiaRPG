import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, 
  Target, 
  Star, 
  Award, 
  User, 
  Menu, 
  Map,
  LogOut,
  Bell,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Mail,
  School,
  GraduationCap,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import logoBranca from '@assets/LOGOSABIA_1750458941873.png';

const StudentDashboardNew: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [showVillajesMenu, setShowVillajesMenu] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [showNotStartedModal, setShowNotStartedModal] = useState(false);

  // Cores da paleta oficial exatas conforme especificação
  const COLORS = {
    matematica: '#D4A054',
    linguagens: '#4DA3A9', 
    ciencias: '#A6E3E9',
    historia: '#FFC23C',
    geografia: '#4CE94A',
    artes: '#312E26',
    primary: '#4DA3A9',
    secondary: '#D4A054',
    accent: '#FFC23C',
    background: '#F5F2E7',
    dark: '#312E26'
  };

  // Dados fictícios de demonstração conforme especificação
  const demoData = {
    perfil: {
      nome: "Aluno Teste",
      email: "aluno@sabiarpg.edu.br",
      escola: "Colégio Paulistana",
      turma: "3º Ano – Manhã",
      nivel: 1,
      avatar: "AL"
    },
    atributos: [
      { nome: "Matemática", xp: 320, maxXp: 1000, percentual: 32, cor: COLORS.matematica },
      { nome: "Linguagens", xp: 500, maxXp: 1000, percentual: 50, cor: COLORS.linguagens },
      { nome: "Ciências", xp: 150, maxXp: 1000, percentual: 15, cor: COLORS.ciencias },
      { nome: "História", xp: 600, maxXp: 1000, percentual: 60, cor: COLORS.historia },
      { nome: "Geografia", xp: 200, maxXp: 1000, percentual: 20, cor: COLORS.geografia },
      { nome: "Artes", xp: 75, maxXp: 1000, percentual: 7, cor: COLORS.artes }
    ],
    conquistas: [
      { nome: "Campeã de Álgebra", icone: Trophy },
      { nome: "Exploradora de Parnaíba", icone: Map },
      { nome: "Historiadora Júnior", icone: Crown }
    ],
    missoes: {
      concluidas: [
        { id: 1, nome: "Batalha dos Números", componente: "Matemática" },
        { id: 2, nome: "Vitória em Ciências Naturais", componente: "Ciências" },
        { id: 3, nome: "Quiz de Geografia", componente: "Geografia" }
      ],
      emProgresso: [
        { id: 4, nome: "Ruas de Oeiras", componente: "História" },
        { id: 5, nome: "Desbravar Delta do Parnaíba", componente: "Geografia" }
      ],
      naoIniciadas: 5
    }
  };

  // Vilarejos para o menu sanduíche
  const vilarejos = [
    { nome: "Teresina", descricao: "Cidade das Duas Correntes" },
    { nome: "Parnaíba", descricao: "Portal do Delta" },
    { nome: "Oeiras", descricao: "Primeira Capital" },
    { nome: "Floriano", descricao: "Princesa do Sul" },
    { nome: "Picos", descricao: "Terra da Cajuína" }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header responsivo 1080×1920 (9×16) */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 max-w-[1080px] mx-auto">
          {/* Menu sanduíche e Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVillajesMenu(true)}
              className="p-2"
            >
              <Menu className="h-6 w-6" style={{ color: COLORS.dark }} />
            </Button>
            
            <img 
              src={logoBranca} 
              alt="SABIÁ RPG" 
              className="h-10 w-10 object-contain"
            />
          </div>

          {/* SABIÁ RPG centralizado */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-bold" style={{ color: COLORS.dark }}>
              SABIÁ RPG
            </h1>
          </div>

          {/* Perfil do usuário */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Modal do Menu de Vilarejos */}
      <Dialog open={showVillajesMenu} onOpenChange={setShowVillajesMenu}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" style={{ color: COLORS.primary }} />
              Vilarejos do Piauí
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {vilarejos.map((vilarejo, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                    {vilarejo.nome}
                  </h3>
                  <p className="text-sm text-gray-600">{vilarejo.descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Layout principal com duas colunas */}
      <div className="max-w-[1080px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna Esquerda - Perfil e Atributos */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Card do Perfil */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                {/* Avatar e Nível */}
                <div className="text-center mb-4">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {demoData.perfil.avatar}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Nv. {demoData.perfil.nivel}
                  </Badge>
                </div>

                {/* Dados do Perfil */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" style={{ color: COLORS.primary }} />
                    <span className="font-medium">{demoData.perfil.nome}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" style={{ color: COLORS.primary }} />
                    <span className="text-gray-600">{demoData.perfil.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4" style={{ color: COLORS.primary }} />
                    <span className="text-gray-600">{demoData.perfil.escola}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" style={{ color: COLORS.primary }} />
                    <span className="text-gray-600">{demoData.perfil.turma}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card dos Atributos */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: COLORS.dark }}>
                  <Target className="h-5 w-5" />
                  Atributos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoData.atributos.map((atributo, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium" style={{ color: COLORS.dark }}>
                        {atributo.nome}
                      </span>
                      <span className="text-gray-600">
                        {atributo.xp} / {atributo.maxXp} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${atributo.percentual}%`,
                          backgroundColor: atributo.cor
                        }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {atributo.percentual}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Card das Conquistas */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: COLORS.dark }}>
                  <Award className="h-5 w-5" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  {demoData.conquistas.map((conquista, index) => {
                    const IconComponent = conquista.icone;
                    return (
                      <div 
                        key={index}
                        className="group relative cursor-pointer"
                        title={conquista.nome}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                          style={{ backgroundColor: COLORS.secondary }}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {conquista.nome}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Status das Missões */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: COLORS.dark }}>
                  <Target className="h-5 w-5" />
                  Status das Missões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Missões Concluídas */}
                <div 
                  className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` }}
                  onClick={() => setShowCompletedModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6" style={{ color: COLORS.primary }} />
                      <div>
                        <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                          Missões Concluídas
                        </h3>
                        <p className="text-sm text-gray-600">
                          {demoData.missoes.concluidas.length} missões finalizadas
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                      {demoData.missoes.concluidas.length}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Clique para ver detalhes
                  </div>
                </div>

                {/* Missões em Progresso */}
                <div 
                  className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: COLORS.secondary, backgroundColor: `${COLORS.secondary}10` }}
                  onClick={() => setShowInProgressModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-6 w-6" style={{ color: COLORS.secondary }} />
                      <div>
                        <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                          Missões em Progresso
                        </h3>
                        <p className="text-sm text-gray-600">
                          {demoData.missoes.emProgresso.length} missões ativas
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                      {demoData.missoes.emProgresso.length}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Clique para ver detalhes
                  </div>
                </div>

                {/* Missões Não Iniciadas */}
                <div 
                  className="p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-shadow"
                  style={{ borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}10` }}
                  onClick={() => setShowNotStartedModal(true)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PauseCircle className="h-6 w-6" style={{ color: COLORS.accent }} />
                      <div>
                        <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                          Missões Não Iniciadas
                        </h3>
                        <p className="text-sm text-gray-600">
                          Aguardando início
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.accent }}>
                      {demoData.missoes.naoIniciadas}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Clique para ver detalhes
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de detalhes das missões concluídas */}
      <Dialog open={showCompletedModal} onOpenChange={setShowCompletedModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" style={{ color: COLORS.primary }} />
              Missões Concluídas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {demoData.missoes.concluidas.map((missao) => (
              <Card key={missao.id} className="border-2" style={{ borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}10` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                        {missao.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Componente: {missao.componente}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        ✅ Concluída
                      </Badge>
                    </div>
                    <CheckCircle className="h-6 w-6" style={{ color: COLORS.primary }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes das missões em progresso */}
      <Dialog open={showInProgressModal} onOpenChange={setShowInProgressModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" style={{ color: COLORS.secondary }} />
              Missões em Progresso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {demoData.missoes.emProgresso.map((missao) => (
              <Card key={missao.id} className="border-2" style={{ borderColor: COLORS.secondary, backgroundColor: `${COLORS.secondary}10` }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold" style={{ color: COLORS.dark }}>
                        {missao.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Componente: {missao.componente}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        🔄 Em Progresso
                      </Badge>
                    </div>
                    <PlayCircle className="h-6 w-6" style={{ color: COLORS.secondary }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes das missões não iniciadas */}
      <Dialog open={showNotStartedModal} onOpenChange={setShowNotStartedModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PauseCircle className="h-5 w-5" style={{ color: COLORS.accent }} />
              Missões Não Iniciadas
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-8">
              <PauseCircle className="h-16 w-16 mx-auto mb-4" style={{ color: COLORS.accent }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.dark }}>
                {demoData.missoes.naoIniciadas} Missões Aguardando
              </h3>
              <p className="text-gray-600">
                Novas missões serão liberadas conforme você progride nos estudos.
              </p>
              <Badge variant="secondary" className="mt-4">
                ⏳ Aguardando início
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboardNew;