import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import mapImage from '@assets/Teresina (1).png';

interface Village {
  id: number;
  name: string;
  coordinates: { x: number; y: number };
  description: string;
  historicalInfo: string;
  population?: string;
  founded?: string;
  characteristics?: string[];
}

interface MapLocationProps {
  village: Village;
  onClick: () => void;
}

const MapLocation: React.FC<MapLocationProps> = ({ village, onClick }) => {
  return (
    <div 
      className="map-point absolute cursor-pointer group transform hover:scale-110 transition-all duration-200"
      style={{
        top: `${village.coordinates.y}%`,
        left: `${village.coordinates.x}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Ponto de localização */}
        <div className="w-6 h-6 bg-red-600 border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-lg z-10 animate-pulse">
          <div className="w-2 h-2 bg-yellow-200 rounded-full"></div>
        </div>
        
        {/* Tooltip hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -top-16 left-1/2 transform -translate-x-1/2 bg-amber-900 bg-opacity-95 p-3 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none border border-amber-600">
          <p className="font-bold text-amber-100 text-sm">{village.name}</p>
          <p className="text-xs text-amber-200">{village.description}</p>
          <p className="text-xs text-amber-300 mt-1">Clique para explorar</p>
        </div>
      </div>
    </div>
  );
};

// Dados dos vilarejos baseados na imagem do mapa
const villages: Village[] = [
  {
    id: 1,
    name: "Teresina",
    coordinates: { x: 50, y: 65 },
    description: "Capital do Piauí, centro do reino",
    historicalInfo: "Teresina foi fundada em 1852 como a primeira capital planejada do Brasil. Localizada na confluência dos rios Parnaíba e Poti, foi estrategicamente posicionada para ser o centro político e econômico do estado. A cidade recebeu o nome em homenagem à Imperatriz Teresa Cristina, esposa de Dom Pedro II.",
    founded: "1852",
    population: "Aproximadamente 870 mil habitantes",
    characteristics: ["Capital planejada", "Centro político", "Confluência de rios", "Hub econômico"]
  },
  {
    id: 2,
    name: "Parnaíba",
    coordinates: { x: 35, y: 25 },
    description: "Porto histórico do Delta do Parnaíba",
    historicalInfo: "Parnaíba é uma das cidades mais antigas do Piauí, fundada no século XVIII. Localizada na foz do rio Parnaíba, foi um importante porto comercial que conectava o interior do estado ao oceano Atlântico. A cidade preserva um rico patrimônio arquitetônico colonial e é a porta de entrada para o Delta do Parnaíba.",
    founded: "Século XVIII",
    population: "Aproximadamente 150 mil habitantes",
    characteristics: ["Porto histórico", "Delta do Parnaíba", "Patrimônio colonial", "Turismo ecológico"]
  },
  {
    id: 3,
    name: "Altos",
    coordinates: { x: 45, y: 48 },
    description: "Cidade serrana com tradições culturais",
    historicalInfo: "Altos é conhecida por sua localização em região de serras e morros, oferecendo um clima mais ameno. A cidade tem forte tradição na produção agrícola e pecuária, além de ser reconhecida por suas manifestações culturais típicas do interior piauiense.",
    founded: "Século XIX",
    population: "Aproximadamente 40 mil habitantes",
    characteristics: ["Região serrana", "Clima ameno", "Tradições rurais", "Agricultura"]
  },
  {
    id: 4,
    name: "Floriano",
    coordinates: { x: 55, y: 58 },
    description: "Centro comercial do centro-sul",
    historicalInfo: "Floriano é uma importante cidade do centro-sul piauiense, conhecida por sua pujança econômica e comercial. A cidade se desenvolveu às margens do rio Parnaíba e tornou-se um centro de distribuição e comércio para toda a região circunvizinha.",
    founded: "1897",
    population: "Aproximadamente 60 mil habitantes",
    characteristics: ["Centro comercial", "Rio Parnaíba", "Economia forte", "Distribuição regional"]
  },
  {
    id: 5,
    name: "Oeiras",
    coordinates: { x: 68, y: 70 },
    description: "Primeira capital do Piauí",
    historicalInfo: "Oeiras foi a primeira capital do Piauí, de 1759 a 1852. A cidade possui um valioso conjunto arquitetônico colonial e é considerada Patrimônio Histórico Nacional. Foi o centro administrativo da capitania e depois província do Piauí por quase um século.",
    founded: "1712",
    population: "Aproximadamente 35 mil habitantes",
    characteristics: ["Primeira capital", "Patrimônio histórico", "Arquitetura colonial", "Centro administrativo antigo"]
  },
  {
    id: 6,
    name: "Picos",
    coordinates: { x: 72, y: 82 },
    description: "Centro do sertão piauiense",
    historicalInfo: "Picos é uma das principais cidades do interior do Piauí, localizada na região semiárida. A cidade desenvolveu-se como centro comercial e de serviços para a região do sertão, sendo conhecida por sua resistência e adaptação ao clima seco.",
    founded: "1890",
    population: "Aproximadamente 80 mil habitantes",
    characteristics: ["Sertão piauiense", "Centro comercial", "Clima semiárido", "Resistência cultural"]
  },
  {
    id: 7,
    name: "Queluzana",
    coordinates: { x: 78, y: 68 },
    description: "Vila rural com tradições sertanejas",
    historicalInfo: "Queluzana é uma pequena comunidade rural que representa as tradições do sertão piauiense. A localidade mantém vivas as práticas culturais típicas do interior, como a agricultura de subsistência e as festividades religiosas tradicionais.",
    founded: "Século XIX",
    population: "Aproximadamente 3 mil habitantes",
    characteristics: ["Comunidade rural", "Tradições sertanejas", "Agricultura de subsistência", "Festividades religiosas"]
  },
  {
    id: 8,
    name: "Bom Jesus",
    coordinates: { x: 82, y: 35 },
    description: "Portal do MATOPIBA",
    historicalInfo: "Bom Jesus é conhecida como a 'Capital do Agronegócio' do Piauí e portal de entrada da região do MATOPIBA. A cidade experimentou grande crescimento econômico com a expansão da fronteira agrícola, tornando-se centro de produção de grãos.",
    founded: "1938",
    population: "Aproximadamente 25 mil habitantes",
    characteristics: ["Agronegócio", "MATOPIBA", "Fronteira agrícola", "Produção de grãos"]
  },
  {
    id: 9,
    name: "Piripiri",
    coordinates: { x: 75, y: 42 },
    description: "Terra dos cajueiros",
    historicalInfo: "Piripiri é famosa pela produção de caju e por estar próxima ao Parque Nacional de Sete Cidades. A cidade desenvolveu-se com base na agricultura e no comércio, mantendo forte ligação com as tradições rurais piauienses.",
    founded: "1930",
    population: "Aproximadamente 65 mil habitantes",
    characteristics: ["Produção de caju", "Sete Cidades", "Agricultura", "Tradições rurais"]
  },
  {
    id: 10,
    name: "Campo Maior",
    coordinates: { x: 68, y: 85 },
    description: "Berço da cultura piauiense",
    historicalInfo: "Campo Maior é conhecida como berço de importantes manifestações culturais piauienses e por ter sido terra natal de figuras históricas importantes. A cidade possui rica tradição em festivais folclóricos e celebrações religiosas.",
    founded: "1761",
    population: "Aproximadamente 50 mil habitantes",
    characteristics: ["Cultura piauiense", "Manifestações folclóricas", "Tradição religiosa", "Figuras históricas"]
  },
  {
    id: 11,
    name: "Barras",
    coordinates: { x: 28, y: 68 },
    description: "Portal de entrada oeste",
    historicalInfo: "Barras localiza-se na região oeste do estado, servindo como porta de entrada para quem vem de estados vizinhos. A cidade desenvolveu-se com base na pecuária e agricultura, mantendo características típicas do interior piauiense.",
    founded: "1870",
    population: "Aproximadamente 45 mil habitantes",
    characteristics: ["Portal oeste", "Pecuária", "Agricultura", "Interior típico"]
  },
  {
    id: 12,
    name: "São Raimundo Nonato",
    coordinates: { x: 15, y: 45 },
    description: "Terra dos sítios arqueológicos",
    historicalInfo: "São Raimundo Nonato é mundialmente conhecida por abrigar o Parque Nacional da Serra da Capivara, com os mais antigos vestígios de presença humana nas Américas. A cidade é centro de importante patrimônio arqueológico mundial.",
    founded: "1912",
    population: "Aproximadamente 35 mil habitantes",
    characteristics: ["Serra da Capivara", "Patrimônio arqueológico", "Vestígios humanos antigos", "Patrimônio mundial"]
  }
];

const MapView: React.FC = () => {
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

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

  const handleVillageClick = (village: Village) => {
    setSelectedVillage(village);
  };

  return (
    <>
      <div className="relative flex-1 overflow-hidden">
        {/* Map Container */}
        <div 
          id="map-container" 
          className="relative w-full h-full overflow-hidden bg-amber-900"
          ref={mapRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* Interactive Map Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div 
              className="relative w-full max-w-6xl transform-gpu"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              {/* Map Content */}
              <div className="relative bg-amber-100 rounded-lg overflow-hidden border-4 border-amber-700 shadow-2xl">
                {/* Map Image */}
                <div className="relative w-full" style={{ paddingTop: '75%' }}>
                  {/* Mapa de Teresina */}
                  <img 
                    src={mapImage}
                    alt="Mapa de Teresina e região - Estilo RPG medieval" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Pontos interativos dos vilarejos */}
                  {villages.map(village => (
                    <MapLocation 
                      key={village.id}
                      village={village}
                      onClick={() => handleVillageClick(village)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button 
              onClick={handleZoomIn} 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-800 border-2 border-amber-600 hover:bg-amber-700 transition shadow-lg"
              disabled={zoomLevel >= 2.5}
              variant="ghost"
              size="icon"
            >
              <ZoomIn className="h-5 w-5 text-amber-100" />
            </Button>
            <Button 
              onClick={handleZoomOut} 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-800 border-2 border-amber-600 hover:bg-amber-700 transition shadow-lg"
              disabled={zoomLevel <= 0.75}
              variant="ghost"
              size="icon"
            >
              <ZoomOut className="h-5 w-5 text-amber-100" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog para informações históricas */}
      <Dialog open={selectedVillage !== null} onOpenChange={() => setSelectedVillage(null)}>
        <DialogContent className="max-w-2xl bg-amber-50 border-4 border-amber-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <span className="text-3xl">🏰</span>
              {selectedVillage?.name}
            </DialogTitle>
            <DialogDescription className="text-amber-700 text-base">
              {selectedVillage?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVillage && (
            <div className="space-y-4 text-amber-800">
              <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                <h3 className="font-bold text-lg mb-2 text-amber-900">História</h3>
                <p className="leading-relaxed">{selectedVillage.historicalInfo}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <h4 className="font-bold text-amber-900 mb-2">Fundação</h4>
                  <p>{selectedVillage.founded}</p>
                </div>
                
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <h4 className="font-bold text-amber-900 mb-2">População</h4>
                  <p>{selectedVillage.population}</p>
                </div>
              </div>
              
              {selectedVillage.characteristics && (
                <div className="bg-amber-100 p-4 rounded-lg border border-amber-300">
                  <h4 className="font-bold text-amber-900 mb-2">Características</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.characteristics.map((char, index) => (
                      <span 
                        key={index}
                        className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-400"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MapView;
