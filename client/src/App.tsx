import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AccessDenied from "@/pages/AccessDenied";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import ManagerDashboard from "@/pages/ManagerDashboardNew";
import SchoolRegistration from "@/pages/SchoolRegistration";
import MissionPage from "@/pages/MissionPage";
import Forum from "@/pages/Forum";
import RankingPage from "@/pages/RankingPage";
import UserProfile from "@/pages/UserProfile";
import TestUpload from "@/pages/TestUpload";
import { GameProvider } from "./context/GameContext";
import { PERMISSIONS } from "@/lib/permissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/auth" component={Login} />
      <Route path="/acesso-negado" component={AccessDenied} />
      <Route path="/teste-upload" component={TestUpload} />
      
      {/* Rotas para todos os usuários autenticados */}
      <ProtectedRoute 
        path="/" 
        component={Dashboard}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/profile" 
        component={UserProfile}
        permissions={[PERMISSIONS.PROFILE_VIEW.id]}
      />
      
      <ProtectedRoute 
        path="/mission/:id" 
        component={MissionPage}
        permissions={[PERMISSIONS.MISSION_VIEW.id]}
      />
      
      <ProtectedRoute 
        path="/forum" 
        component={Forum}
        permissions={[PERMISSIONS.FORUM_VIEW.id]}
      />
      
      <ProtectedRoute 
        path="/ranking" 
        component={RankingPage}
        requireAuth={true}
      />
      
      {/* Rotas apenas para professores */}
      <ProtectedRoute 
        path="/teacher" 
        component={TeacherDashboard}
        permissions={[
          PERMISSIONS.REPORT_STUDENT_VIEW.id,
          PERMISSIONS.CLASS_MANAGE.id
        ]}
      />
      
      {/* Rotas apenas para gestores */}
      <ProtectedRoute 
        path="/manager" 
        component={ManagerDashboard}
        permissions={[
          PERMISSIONS.REPORT_SCHOOL_VIEW.id,
          PERMISSIONS.SCHOOL_CONFIG.id
        ]}
      />
      
      <ProtectedRoute 
        path="/school-registration" 
        component={SchoolRegistration}
        permissions={[
          PERMISSIONS.SCHOOL_CONFIG.id
        ]}
      />
      
      {/* Página não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}



import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <GameProvider>
          <Router />
        </GameProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
