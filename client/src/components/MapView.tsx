import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';

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
            className="relative w-full max-w-4xl transform-gpu"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            {/* Stylized Map Border */}
            <div className="absolute inset-0 border-8 border-primary rounded-xl opacity-70"></div>
            
            {/* Map Content */}
            <div className="relative bg-parchment-dark rounded-lg overflow-hidden">
              {/* Map Image */}
              <div className="relative w-full" style={{ paddingTop: '75%' }}>
                {/* Map Illustration */}
                <img 
                  src="https://images.unsplash.com/photo-1519009647776-5bbd5b7ada80?q=80&w=1000&auto=format&fit=crop" 
                  alt="Mapa do Piauí em estilo RPG medieval" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                
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
    </div>
  );
};

export default MapView;
