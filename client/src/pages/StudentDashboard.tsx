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
        <div className="flex-1 relative bg-gradient-to-br from-green-800 via-green-700 to-amber-800">
          <div 
            className="w-full h-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 768'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23228B22'/%3E%3Cstop offset='50%25' style='stop-color:%23006400'/%3E%3Cstop offset='100%25' style='stop-color:%238B4513'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cpath d='M100,400 Q300,350 500,380 T900,400 L900,500 Q700,520 500,490 T100,500 Z' fill='%234169E1' opacity='0.7'/%3E%3Cpath d='M0,450 Q200,430 400,450 T800,460 L1024,470 L1024,768 L0,768 Z' fill='%234169E1' opacity='0.5'/%3E%3Crect x='400' y='200' width='80' height='80' fill='%238B4513' rx='5'/%3E%3Crect x='405' y='190' width='70' height='20' fill='%23CD853F'/%3E%3Cpolygon points='440,190 420,170 460,170' fill='%23B22222'/%3E%3Crect x='200' y='150' width='60' height='60' fill='%238B4513' rx='3'/%3E%3Cpolygon points='230,150 215,135 245,135' fill='%23B22222'/%3E%3Crect x='650' y='180' width='70' height='70' fill='%238B4513' rx='4'/%3E%3Cpolygon points='685,180 670,165 700,165' fill='%23B22222'/%3E%3Crect x='300' y='300' width='50' height='50' fill='%238B4513' rx='2'/%3E%3Cpolygon points='325,300 315,290 335,290' fill='%23B22222'/%3E%3Crect x='600' y='320' width='55' height='55' fill='%238B4513' rx='3'/%3E%3Cpolygon points='627,320 617,310 637,310' fill='%23B22222'/%3E%3Ctext x='440' y='250' text-anchor='middle' fill='%23FFFFE0' font-size='12' font-family='serif'%3EPalácio%3C/text%3E%3Ctext x='230' y='175' text-anchor='middle' fill='%23FFFFE0' font-size='10' font-family='serif'%3ECidade%3C/text%3E%3Ctext x='685' y='205' text-anchor='middle' fill='%23FFFFE0' font-size='10' font-family='serif'%3ETorre%3C/text%3E%3Ctext x='325' y='325' text-anchor='middle' fill='%23FFFFE0' font-size='8' font-family='serif'%3EVila%3C/text%3E%3Ctext x='627' y='345' text-anchor='middle' fill='%23FFFFE0' font-size='8' font-family='serif'%3EForte%3C/text%3E%3C/svg%3E")`
            }}
          >
            {/* Map Overlay Elements */}
            <div className="absolute bottom-4 left-4 flex space-x-2">
              <Button size="sm" className="bg-black/60 hover:bg-black/80 text-white">
                <MapPin className="w-4 h-4 mr-1" />
                Zoom +
              </Button>
              <Button size="sm" className="bg-black/60 hover:bg-black/80 text-white">
                <MapPin className="w-4 h-4 mr-1" />
                Zoom -
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
              <h3 className="text-lg font-bold text-amber-400 mb-2">Nenhuma Missão Selecionada</h3>
              <p className="text-sm text-gray-300 mb-4">
                Selecione uma missão no mapa ou na lista de missões disponíveis
              </p>
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                Ver Missões Disponíveis
              </Button>
            </div>
          </div>

          {/* Mission Stats at Bottom */}
          <div className="space-y-4 border-t border-[#5a4d3a] pt-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Missões</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#2a2516] p-2 rounded">
                <div className="text-amber-400 font-bold">Ativas (0)</div>
              </div>
              <div className="bg-[#2a2516] p-2 rounded">
                <div className="text-green-400 font-bold">Disponíveis (0)</div>
              </div>
              <div className="bg-[#2a2516] p-2 rounded">
                <div className="text-blue-400 font-bold">Concluídas (0)</div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black">
              <Scroll className="w-4 h-4 mr-2" />
              Ver Todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}