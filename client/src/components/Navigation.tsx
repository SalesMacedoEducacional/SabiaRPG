import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from './ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { 
  MapPin, 
  Sword, 
  Trophy, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu, 
  Bell 
} from 'lucide-react';
import { Badge } from './ui/badge';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [notificationCount, setNotificationCount] = useState(3);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };
  
  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-dark-dark shadow-lg border-b border-primary z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <img 
                    src="/assets/sabia-logo.png" 
                    alt="Logomarca SABIÁ RPG" 
                    className="logo logo-sm"
                  />
                  <span className="ml-3 font-medieval text-2xl text-accent">SABIÁ RPG</span>
                </a>
              </Link>
            </div>
          </div>
          
          {/* Navigation Menu - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/">
              <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary text-white' : 'hover:bg-primary hover:text-white'}`}>
                <MapPin className="inline mr-1 h-4 w-4" />
                Mapa
              </a>
            </Link>
            <Link href="/mission/active">
              <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/mission/active') ? 'bg-primary text-white' : 'hover:bg-primary hover:text-white'}`}>
                <Sword className="inline mr-1 h-4 w-4" />
                Missões
              </a>
            </Link>
            <Link href="/ranking">
              <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/ranking') ? 'bg-primary text-white' : 'hover:bg-primary hover:text-white'}`}>
                <Trophy className="inline mr-1 h-4 w-4" />
                Ranking
              </a>
            </Link>
            <Link href="/forum">
              <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/forum') ? 'bg-primary text-white' : 'hover:bg-primary hover:text-white'}`}>
                <MessageSquare className="inline mr-1 h-4 w-4" />
                Fórum
              </a>
            </Link>
            {user.role !== 'student' && (
              <Link href="/teacher">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/teacher') ? 'bg-secondary text-white' : 'hover:bg-secondary hover:text-white'}`}>
                  Painel de Professor
                </a>
              </Link>
            )}
          </div>
          
          {/* User Menu and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-parchment" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-dark-light border-primary">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary" />
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold">Nova missão disponível</p>
                    <p className="text-xs text-parchment-dark">O Desafio da Torre de Teresina está aguardando por você!</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold">Conquista desbloqueada</p>
                    <p className="text-xs text-parchment-dark">Você ganhou o troféu "Explorador Intrépido"</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-bold">Professor respondeu</p>
                    <p className="text-xs text-parchment-dark">Uma resposta à sua pergunta foi publicada no fórum</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* XP and Level - Desktop */}
            <div className="hidden md:flex items-center bg-dark-light rounded-full px-3 py-1">
              <svg 
                className="text-accent mr-2 h-4 w-4" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-sm font-medium">{user.xp} XP</span>
              <span className="mx-2 text-parchment-dark">|</span>
              <span className="text-sm font-medium">Nível {user.level}</span>
            </div>
            
            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="bg-primary text-parchment">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-dark-light border-primary">
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-dark-light border-primary w-[250px] p-0">
                <div className="p-4 border-b border-primary">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.username} />
                      <AvatarFallback className="bg-primary text-parchment">
                        {user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medieval text-accent">{user.username}</p>
                      <p className="text-xs text-parchment-dark">Nível {user.level} • {user.xp} XP</p>
                    </div>
                  </div>
                </div>
                <div className="py-4">
                  <nav className="flex flex-col space-y-1">
                    <Link href="/">
                      <a className={`flex items-center px-4 py-3 ${isActive('/') ? 'bg-primary' : ''}`}>
                        <MapPin className="mr-3 h-5 w-5" />
                        <span>Mapa</span>
                      </a>
                    </Link>
                    <Link href="/mission/active">
                      <a className={`flex items-center px-4 py-3 ${isActive('/mission/active') ? 'bg-primary' : ''}`}>
                        <Sword className="mr-3 h-5 w-5" />
                        <span>Missões</span>
                      </a>
                    </Link>
                    <Link href="/ranking">
                      <a className={`flex items-center px-4 py-3 ${isActive('/ranking') ? 'bg-primary' : ''}`}>
                        <Trophy className="mr-3 h-5 w-5" />
                        <span>Ranking</span>
                      </a>
                    </Link>
                    <Link href="/forum">
                      <a className={`flex items-center px-4 py-3 ${isActive('/forum') ? 'bg-primary' : ''}`}>
                        <MessageSquare className="mr-3 h-5 w-5" />
                        <span>Fórum</span>
                      </a>
                    </Link>
                    {user.role !== 'student' && (
                      <Link href="/teacher">
                        <a className={`flex items-center px-4 py-3 ${isActive('/teacher') ? 'bg-secondary' : ''}`}>
                          <span>Painel de Professor</span>
                        </a>
                      </Link>
                    )}
                    <Link href="/profile">
                      <a className={`flex items-center px-4 py-3 ${isActive('/profile') ? 'bg-primary' : ''}`}>
                        <User className="mr-3 h-5 w-5" />
                        <span>Perfil</span>
                      </a>
                    </Link>
                    <div 
                      className="flex items-center px-4 py-3 cursor-pointer hover:bg-primary" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Sair</span>
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
