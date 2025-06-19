import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Trophy, Target, Clock, Star, Calendar } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment to-parchment-light p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-dark">
            Bem-vindo(a), {user?.nome}!
          </h1>
          <p className="text-parchment-dark">
            Continue sua jornada de aprendizado no SABI RPG
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">XP Total</CardTitle>
              <Star className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">1,250</div>
              <p className="text-xs text-parchment-dark">
                +80 XP hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missões</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">12/15</div>
              <p className="text-xs text-parchment-dark">
                Concluídas esta semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <p className="text-xs text-parchment-dark">
                Desbloqueadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Hoje</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">2h 30m</div>
              <p className="text-xs text-parchment-dark">
                Meta: 3h diárias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Missões Ativas */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Missões Ativas
                </CardTitle>
                <CardDescription>
                  Continue suas aventuras de aprendizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-accent/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Explorando Frações</h3>
                    <Badge variant="secondary">Matemática</Badge>
                  </div>
                  <p className="text-sm text-parchment-dark">
                    Descubra os segredos das frações na Torre dos Números
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>3/5 etapas</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <Button className="w-full" variant="outline">
                    Continuar Missão
                  </Button>
                </div>

                <div className="border border-accent/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Verbos do Passado</h3>
                    <Badge variant="secondary">Português</Badge>
                  </div>
                  <p className="text-sm text-parchment-dark">
                    Viaje no tempo e domine os verbos do passado
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>1/4 etapas</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <Button className="w-full" variant="outline">
                    Continuar Missão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Próximas Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Próximas Atividades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Prova de História</p>
                    <p className="text-xs text-parchment-dark">Amanhã, 14h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Projeto de Ciências</p>
                    <p className="text-xs text-parchment-dark">Sexta, 16h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conquistas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mestre dos Números</p>
                    <p className="text-xs text-parchment-dark">Completou 10 missões de matemática</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Leitor Voraz</p>
                    <p className="text-xs text-parchment-dark">Leu 5 textos esta semana</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}