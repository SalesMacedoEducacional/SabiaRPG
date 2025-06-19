import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Scroll, Trophy, Users, HelpCircle, User } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#2a2516] text-white font-lato overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#3d3728] border-b border-[#5a4d3a]">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏰</span>
            </div>
            <span className="text-xl font-bold text-amber-400">SABIÁ RPG</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-[#5a4d3a] flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Mapa
          </Button>
          <Button variant="ghost" className="text-white hover:bg-[#5a4d3a] flex items-center gap-2">
            <Scroll className="w-4 h-4" />
            Missões
          </Button>
          <Button variant="ghost" className="text-white hover:bg-[#5a4d3a] flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Ranking
          </Button>
          <Button variant="ghost" className="text-white hover:bg-[#5a4d3a] flex items-center gap-2">
            <Users className="w-4 h-4" />
            Fórum
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <span>0 XP</span>
            <span>|</span>
            <span>Nível 1</span>
          </div>
          <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Attributes Panel */}
        <div className="w-64 md:w-72 lg:w-80 bg-[#3d3728] border-r border-[#5a4d3a] p-4 space-y-6 flex-shrink-0">
          {/* Avatar and Character Info */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-amber-600 rounded-full mx-auto flex items-center justify-center text-2xl font-bold">
              AL
            </div>
            <div>
              <div className="text-sm text-amber-400">Aluno</div>
              <div className="text-xs text-gray-300">Aprendiz de Sabedoria</div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Atributos</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Matemática</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Linguagens</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Ciências</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>História</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Geografia</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Artes</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-[#2a2516] rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Conquistas</h3>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-12 h-12 border-2 border-gray-600 rounded-full bg-[#2a2516]"></div>
              ))}
            </div>
          </div>

          {/* Level and XP */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm font-bold text-amber-400">Nível 1</div>
              <div className="text-xs text-gray-300">0/1000 XP</div>
            </div>
            <Progress value={0} className="h-3 bg-[#2a2516]" />
            <div className="text-xs text-center text-gray-400">0/1000 XP para o próximo nível</div>
          </div>
        </div>

        {/* Central Map Area */}
        <div className="flex-1 relative bg-gradient-to-b from-green-500 via-green-600 to-blue-500">
          <div className="w-full h-full relative overflow-hidden">
            {/* Upper green landscape area */}
            <div className="absolute top-0 left-0 w-full h-3/5 bg-gradient-to-b from-green-500 to-green-600">
              {/* Buildings */}
              {/* Cidade (top left) */}
              <div className="absolute top-16 left-48">
                <div className="relative">
                  <div className="w-16 h-12 bg-amber-800 rounded-sm"></div>
                  <div className="absolute -top-2 left-2 w-12 h-3 bg-red-700"></div>
                  <div className="absolute -top-4 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-700"></div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">Cidade</div>
                </div>
              </div>

              {/* Palácio (center) */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-20 h-16 bg-amber-800 rounded-sm"></div>
                  <div className="absolute -top-2 left-2 w-16 h-4 bg-red-700"></div>
                  <div className="absolute -top-4 left-8 w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-red-700"></div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">Palácio</div>
                </div>
              </div>

              {/* Torre (top right) */}
              <div className="absolute top-16 right-48">
                <div className="relative">
                  <div className="w-16 h-12 bg-amber-800 rounded-sm"></div>
                  <div className="absolute -top-2 left-2 w-12 h-3 bg-red-700"></div>
                  <div className="absolute -top-4 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-700"></div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">Torre</div>
                </div>
              </div>

              {/* Vila (bottom left) */}
              <div className="absolute bottom-8 left-56">
                <div className="relative">
                  <div className="w-12 h-10 bg-amber-800 rounded-sm"></div>
                  <div className="absolute -top-2 left-1 w-10 h-3 bg-red-700"></div>
                  <div className="absolute -top-4 left-5 w-0 h-0 border-l-3 border-r-3 border-b-3 border-transparent border-b-red-700"></div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">Vila</div>
                </div>
              </div>

              {/* Forte (bottom right) */}
              <div className="absolute bottom-8 right-56">
                <div className="relative">
                  <div className="w-14 h-12 bg-amber-800 rounded-sm"></div>
                  <div className="absolute -top-2 left-1 w-12 h-3 bg-red-700"></div>
                  <div className="absolute -top-4 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-700"></div>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold">Forte</div>
                </div>
              </div>
            </div>

            {/* Lower blue water area */}
            <div className="absolute bottom-0 left-0 w-full h-2/5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700">
              {/* Water ripple effect */}
              <div className="w-full h-full bg-gradient-to-r from-blue-300/40 via-blue-400/30 to-blue-500/40"></div>
              {/* Water surface reflection */}
              <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-blue-300/60 to-transparent"></div>
            </div>

            {/* Map controls */}
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white border border-teal-600">
                <span className="text-xs">🔍 Zoom +</span>
              </Button>
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white border border-teal-600">
                <span className="text-xs">🔍 Zoom -</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Mission Details */}
        <div className="w-80 md:w-96 lg:w-80 bg-[#3d3728] border-l border-[#5a4d3a] p-4 space-y-6 flex-shrink-0">
          {/* Mission Selection Status */}
          <div className="text-center space-y-4">
            <HelpCircle className="w-16 h-16 text-gray-500 mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-amber-300 mb-2">NENHUMA MISSÃO SELECIONADA</h3>
              <p className="text-sm text-gray-400 mb-4">
                Selecione uma missão no mapa ou na lista de missões disponíveis
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2">
                Ver Missões Disponíveis
              </Button>
            </div>
          </div>

          {/* Mission Stats at Bottom */}
          <div className="space-y-4 border-t border-[#5a4d3a] pt-4">
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wide">MISSÕES</h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-[#2a2419] p-3 rounded border border-[#5a4d3a]">
                <div className="text-green-400 font-bold mb-1">Ativas (8)</div>
                <div className="text-gray-400">Disponíveis</div>
              </div>
              <div className="bg-[#2a2419] p-3 rounded border border-[#5a4d3a]">
                <div className="text-orange-400 font-bold mb-1">Concluídas (9)</div>
                <div className="text-gray-400">Concluídas</div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-amber-300 border-amber-600 hover:bg-amber-600/20 bg-transparent">
              📋 Ver Todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}