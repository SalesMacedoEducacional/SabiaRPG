import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment to-parchment-light p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-dark">
            Painel do Professor - {user?.nome}
          </h1>
          <p className="text-parchment-dark">
            Gerencie suas turmas e acompanhe o progresso dos alunos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">28</div>
              <p className="text-xs text-parchment-dark">
                3 turmas
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missões</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-xs text-parchment-dark">
                Ativas esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregas</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">45</div>
              <p className="text-xs text-parchment-dark">
                Para revisar
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">78%</div>
              <p className="text-xs text-parchment-dark">
                +5% esta semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Turmas */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Minhas Turmas
                </CardTitle>
                <CardDescription>
                  Acompanhe o progresso de cada turma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-accent/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">6º Ano A</h3>
                    <Badge variant="secondary">Matemática</Badge>
                  </div>
                  <p className="text-sm text-parchment-dark">
                    12 alunos • Missão atual: Frações e Decimais
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da Turma</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" variant="outline">
                      Nova Missão
                    </Button>
                  </div>
                </div>

                <div className="border border-accent/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">7º Ano B</h3>
                    <Badge variant="secondary">Português</Badge>
                  </div>
                  <p className="text-sm text-parchment-dark">
                    16 alunos • Missão atual: Análise Sintática
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso da Turma</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" variant="outline">
                      Nova Missão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missões Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Missões para Revisar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium">Resolução de Problemas</p>
                    <p className="text-sm text-parchment-dark">6º Ano A • 8 entregas</p>
                  </div>
                  <Button size="sm">Revisar</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Redação Narrativa</p>
                    <p className="text-sm text-parchment-dark">7º Ano B • 12 entregas</p>
                  </div>
                  <Button size="sm">Revisar</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Agenda */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Reunião Pedagógica</p>
                    <p className="text-xs text-parchment-dark">Hoje, 15h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Avaliação 6º Ano</p>
                    <p className="text-xs text-parchment-dark">Amanhã, 8h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Entrega de Notas</p>
                    <p className="text-xs text-parchment-dark">Sexta, 17h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Criar Nova Missão
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Turmas
                </Button>
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Esta Semana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Missões criadas</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Entregas revisadas</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Feedback enviado</span>
                  <span className="font-bold">18</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}