import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, Info, X } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/hooks/use-auth';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import mapaImage from '@/assets/mapa.png';

interface MapLocationProps {
  location: {
    id: number;
    name: string;
    description: string;
    coordinates: { x: number; y: number };
    icon: string;
    unlockLevel: number;
  };
  isLocked: boolean;
  isActive: boolean;
  onClick: () => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ location, isLocked, isActive, onClick }) => {
  const getIconClass = () => {
    switch (location.icon) {
      case 'castle':
        return 'fa-castle';
      case 'water':
        return 'fa-water';
      case 'landmark':
        return 'fa-landmark';
      case 'mountain':
        return 'fa-mountain';
      default:
        return 'fa-map-marker';
    }
  };

  const size = isActive ? 'w-12 h-12' : 'w-10 h-10';
  const bg = isLocked ? 'bg-dark-light' : 
             (location.icon === 'castle' ? 'bg-primary-dark' : 
             location.icon === 'water' ? 'bg-secondary-dark' :
             location.icon === 'landmark' ? 'bg-primary-light' :
             'bg-secondary');
  
  const borderColor = isLocked ? 'border-primary-dark' : 'border-accent';
  const textColor = isLocked ? 'text-parchment-dark' : 'text-accent';

  return (
    <div 
      className={`map-point absolute cursor-pointer group`}
      style={{
        top: `${location.coordinates.y}%`,
        left: `${location.coordinates.x}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div className="relative">
        <div className={`${size} ${bg} border-2 ${borderColor} rounded-full flex items-center justify-center shadow-lg z-10`}>
          <i className={`fas ${getIconClass()} ${textColor} text-xl`}></i>
        </div>
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 ${bg} border-2 ${borderColor} rotate-45`}></div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-dark p-2 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none">
          <p className="font-medieval text-accent">{location.name}</p>
          <p className="text-xs text-parchment">
            {isLocked ? `Desbloqueado no nível ${location.unlockLevel}` : location.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const MapPathConnection: React.FC<{
  from: { x: number; y: number };
  to: { x: number; y: number };
  isCompleted: boolean;
  isActive: boolean;
}> = ({ from, to, isCompleted, isActive }) => {
  const pathClass = isCompleted ? 'stroke-accent' : 
                  isActive ? 'stroke-accent opacity-60' : 'stroke-primary-dark';
  
  const dashStyle = {
    strokeDasharray: '5,3',
    strokeDashoffset: isActive || isCompleted ? '0' : '750',
  };

  return (
    <path 
      d={`M${from.x},${from.y} Q${(from.x + to.x) / 2 + (to.y - from.y) / 4},${(from.y + to.y) / 2 - (to.x - from.x) / 4} ${to.x},${to.y}`}
      fill="none" 
      stroke="currentColor" 
      className={pathClass}
      strokeWidth="1.5"
      style={dashStyle}
    />
  );
};

// Dados dos vilarejos do mapa
const vilarejos = [
  {
    id: 1,
    nome: "Teresina",
    posicao: { x: 50, y: 50 },
    descricao: "Capital do Reino Educacional do Piauí",
    detalhes: [
      "Círculo central murado com alto muro de pedra e torres de vigia",
      "Confluência de dois rios representada por fitas azuis que se unem formando um Y",
      "No coração, um pequeno cristal ou esfera brilhante (centro mágico da capital)",
      "Pequenas bandeirolas tremulando sobre as muralhas",
      "Caminhos de terra batida ligando o portão principal aos arredores"
    ]
  },
  {
    id: 2,
    nome: "Serra da Capivara",
    posicao: { x: 25, y: 75 },
    descricao: "Região arqueológica com arte rupestre ancestral",
    detalhes: [
      "Desenhos de cânions vermelhos escavados em linhas pontilhadas",
      "Pequenas gravuras rupestres (silhuetas de bisões, cervos e figuras humanas) pintadas nas rochas",
      "Pedras destacadas com relevo sutil",
      "Cactus e arbustos ralos típicos da caatinga ao redor"
    ]
  },
  {
    id: 3,
    nome: "Delta do Parnaíba",
    posicao: { x: 75, y: 25 },
    descricao: "Portal aquático do reino com canais navegáveis",
    detalhes: [
      "Rede de pequenos canais sinuosos em tom aqua-claro",
      "Mini-barquinhos à vela e remos desenhados navegando pelos canais",
      "Vegetação densa desenhada à margem (palmeiras e manguezais estilizados)",
      "Ícone de uma criatura aquática fantástica (pequeno tritão ou sereia rústica) emergindo da água"
    ]
  },
  {
    id: 4,
    nome: "Oeiras",
    posicao: { x: 40, y: 65 },
    descricao: "Antiga capital com arquitetura colonial preservada",
    detalhes: [
      "Grupo de casas coloniais com telhados em 'V' e chaminés",
      "Igreja barroca com fachada de pedra esculpida e duas torres",
      "Ruas de paralelepípedos desenhadas em linhas tracejadas",
      "Pequenas lanternas penduradas nas esquinas"
    ]
  },
  {
    id: 5,
    nome: "Bom Jesus",
    posicao: { x: 60, y: 80 },
    descricao: "Santuário sagrado nas colinas",
    detalhes: [
      "Duas ou três capelas/igrejas no topo de colinas arredondadas",
      "Cruz ornamentada em pedra no ponto mais alto",
      "Trilha de escadas esculpidas na encosta",
      "Símbolos de aura (linhas de luz) irradiando das igrejas"
    ]
  },
  {
    id: 6,
    nome: "Floriano",
    posicao: { x: 45, y: 55 },
    descricao: "Cidade das pontes e arquitetura elegante",
    detalhes: [
      "Ponte de pedra arqueada cruzando o rio",
      "Cúpulas arredondadas (fontes de estilo colonial) em alguns prédios",
      "Casas de alvenaria com varandas e balaústres",
      "Pequenos barcos de pesca ancorados na margem"
    ]
  },
  {
    id: 7,
    nome: "Picos",
    posicao: { x: 55, y: 70 },
    descricao: "Centro comercial e de artesanato",
    detalhes: [
      "Feira ao ar livre: tendas triangulares, barracas com cestos de cereais e artesanato",
      "Carroças e pequenas carroças de bois",
      "Torre de vigia (torre alta em pedra) no centro da praça",
      "Rua principal de calçamento simples levando até a feira"
    ]
  },
  {
    id: 8,
    nome: "Piracuruca",
    posicao: { x: 35, y: 35 },
    descricao: "Estação ferroviária histórica",
    detalhes: [
      "Estação ferroviária de pedra e madeira, com arquitetura antiga",
      "Trilhos de ferro que adotam uma curva levemente ondulada",
      "Trem a vapor estilizado (locomotiva com chaminé fumegante)",
      "Pequenos postes de sinalização ferroviária"
    ]
  },
  {
    id: 9,
    nome: "Jaicós",
    posicao: { x: 65, y: 60 },
    descricao: "Vila cultural com tradições folclóricas",
    detalhes: [
      "Máscaras folclóricas penduradas em palmeiras rústicas",
      "Tambores sobre suportes de madeira",
      "Figuras de dançarinos estilizados ao lado das construções",
      "Casarões simples de taipa com telhado de cerâmica"
    ]
  },
  {
    id: 10,
    nome: "Barras",
    posicao: { x: 30, y: 45 },
    descricao: "Mercado central do reino",
    detalhes: [
      "Praça central com fonte e várias barracas de mercado",
      "Balança de feira em destaque num canto",
      "Arquitetura colonial com sacadas em ferro forjado",
      "Pergolados com trepadeiras desenhados nas laterais"
    ]
  },
  {
    id: 11,
    nome: "Paulistana",
    posicao: { x: 70, y: 75 },
    descricao: "Posto avançado da Transnordestina",
    detalhes: [
      "Terreno semiárido com pequenos arbustos de caatinga",
      "Trilhos de ferro reta cortando o solo, com um vagão de carga ao lado",
      "Pequeno ícone de trem da Transnordestina (leve símbolo de roda dentada)",
      "Colinas baixas pontilhadas ao fundo"
    ]
  },
  {
    id: 12,
    nome: "Campo Maior",
    posicao: { x: 50, y: 40 },
    descricao: "Fortaleza militar estratégica",
    detalhes: [
      "Campo amplo com duas colinas na margem",
      "Canhões de bronze apontados em direções opostas",
      "Bandeiras tremulando sobre cada colina",
      "Monumento central (obelisco ou pedestal com brasão)"
    ]
  }
];

const MapView: React.FC = () => {
  const { locations, learningPaths, startMission } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [showVilarejos, setShowVilarejos] = useState(false);
  const [selectedVilarejo, setSelectedVilarejo] = useState<typeof vilarejos[0] | null>(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!mapRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !mapRef.current) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!mapRef.current || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ 
      x: e.touches[0].clientX - pan.x, 
      y: e.touches[0].clientY - pan.y 
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !mapRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleLocationClick = (locationId: number) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;
    
    if (user && location.unlockLevel > user.level) {
      toast({
        title: "Localização bloqueada",
        description: `Esta localização será desbloqueada no nível ${location.unlockLevel}.`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedLocation(prevId => prevId === locationId ? null : locationId);
    
    // Get available learning paths for this location
    const availablePaths = learningPaths.filter(path => path.locationId === locationId);
    
    if (availablePaths.length === 0) {
      toast({
        title: "Nenhuma missão disponível",
        description: "Esta localização ainda não possui missões disponíveis.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Map Container */}
      <div 
        id="map-container" 
        className="relative w-full h-full overflow-hidden bg-map-pattern bg-cover bg-center"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1594818379496-da1e345388c0?q=80&w=1964&auto=format&fit=crop')",
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Interactive Map Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div 
            className="relative transform-gpu"
            style={{
              width: '1536px',
              height: '1024px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Stylized Map Border */}
            <div className="absolute inset-0 border-8 border-primary rounded-xl opacity-70"></div>
            
            {/* Map Content */}
            <div className="relative bg-parchment-dark rounded-lg overflow-hidden w-full h-full">
              {/* Map Image */}
              <div className="relative w-full h-full">
                {/* Map Illustration */}
                <img 
                  src={mapaImage} 
                  alt="Reino Educacional do Piauí - Mapa Interativo" 
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                {/* Vilarejos - Pontos Interativos */}
                {vilarejos.map(vilarejo => (
                  <div
                    key={vilarejo.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${vilarejo.posicao.x}%`,
                      top: `${vilarejo.posicao.y}%`,
                    }}
                    onClick={() => setSelectedVilarejo(vilarejo)}
                  >
                    <div className="w-4 h-4 bg-primary rounded-full border-2 border-accent shadow-lg group-hover:scale-125 transition-transform duration-200">
                      <div className="w-full h-full bg-accent rounded-full animate-pulse opacity-70"></div>
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-dark-light px-2 py-1 rounded text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {vilarejo.nome}
                    </div>
                  </div>
                ))}
                
                {/* Map Locations - Interactive Points */}
                {locations.map(location => (
                  <MapLocation 
                    key={location.id}
                    location={location}
                    isLocked={user ? user.level < location.unlockLevel : true}
                    isActive={selectedLocation === location.id}
                    onClick={() => handleLocationClick(location.id)}
                  />
                ))}
                
                {/* Path Connections (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Connection paths between locations */}
                  {locations.length >= 2 && (
                    <>
                      <MapPathConnection 
                        from={locations[0].coordinates} 
                        to={locations[1].coordinates} 
                        isCompleted={true}
                        isActive={false}
                      />
                      
                      {locations.length >= 3 && (
                        <MapPathConnection 
                          from={locations[0].coordinates} 
                          to={locations[2].coordinates} 
                          isCompleted={false}
                          isActive={true}
                        />
                      )}
                      
                      {locations.length >= 4 && (
                        <MapPathConnection 
                          from={locations[2].coordinates} 
                          to={locations[3].coordinates} 
                          isCompleted={false}
                          isActive={false}
                        />
                      )}
                    </>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button 
            onClick={() => setShowVilarejos(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-primary hover:bg-primary transition"
            variant="ghost"
            size="icon"
          >
            <Info className="h-5 w-5 text-parchment" />
          </Button>
          <Button 
            onClick={handleZoomIn} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-primary hover:bg-primary transition"
            disabled={zoomLevel >= 2.5}
            variant="ghost"
            size="icon"
          >
            <ZoomIn className="h-5 w-5 text-parchment" />
          </Button>
          <Button 
            onClick={handleZoomOut} 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-primary hover:bg-primary transition"
            disabled={zoomLevel <= 0.75}
            variant="ghost"
            size="icon"
          >
            <ZoomOut className="h-5 w-5 text-parchment" />
          </Button>
        </div>
      </div>

      {/* Modal de Informações dos Vilarejos */}
      <Dialog open={showVilarejos} onOpenChange={setShowVilarejos}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-parchment border-4 border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-dark mb-4 text-center">
              Reino Educacional do Piauí - Vilarejos
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vilarejos.map(vilarejo => (
              <div 
                key={vilarejo.id}
                className="bg-dark-light p-4 rounded-lg border border-primary cursor-pointer hover:bg-primary-dark transition-colors duration-200"
                onClick={() => {
                  setSelectedVilarejo(vilarejo);
                  setShowVilarejos(false);
                }}
              >
                <h3 className="font-bold text-accent text-lg mb-2">{vilarejo.nome}</h3>
                <p className="text-parchment text-sm mb-3">{vilarejo.descricao}</p>
                <div className="text-xs text-parchment-dark">
                  Clique para ver detalhes
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Vilarejo Específico */}
      <Dialog open={!!selectedVilarejo} onOpenChange={() => setSelectedVilarejo(null)}>
        <DialogContent className="max-w-2xl bg-parchment border-4 border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-dark mb-2">
              {selectedVilarejo?.nome}
            </DialogTitle>
            <p className="text-primary-dark text-lg mb-4">{selectedVilarejo?.descricao}</p>
          </DialogHeader>
          <div className="space-y-3">
            <h4 className="font-semibold text-dark text-lg mb-3">Características Visuais:</h4>
            <ul className="space-y-2">
              {selectedVilarejo?.detalhes.map((detalhe, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-dark-light"
                >
                  <span className="text-primary font-bold">•</span>
                  <span className="text-sm leading-relaxed">{detalhe}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setSelectedVilarejo(null)}
              className="bg-primary hover:bg-primary-dark text-parchment"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;
