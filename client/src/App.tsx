import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AccessDenied from "@/pages/AccessDenied";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
// Dashboards do gestor
import ManagerDashboard from "@/pages/ManagerDashboard";
import ManagerDashboardModerno from "@/pages/ManagerDashboardModerno";
import SchoolRegistration from "@/pages/SchoolRegistration";
import UserRegistrationSimple from "@/pages/UserRegistrationSimple";
import UserManagement from "@/pages/UserManagement";
import UserManagementAdvanced from "@/components/manager/UserManagement";
import ClassRegistration from "@/pages/ClassRegistration";
import ClassListPage from "@/pages/ClassListPage";
import ClassManagement from "@/pages/ClassManagement";
import MissionPage from "@/pages/MissionPage";
import Forum from "@/pages/Forum";
import RankingPage from "@/pages/RankingPage";
import UserProfile from "@/pages/UserProfile";
import TestUpload from "@/pages/TestUpload";
import LoginTest from "@/pages/login-test";
import TesteUsuarioPage from "@/pages/teste-criacao-usuario";
import TesteCadastroSimplificado from "@/pages/teste-cadastro-simplificado";
import SyncDemo from "@/pages/SyncDemo";
import { GameProvider } from "./context/GameContext";
import { SchoolProvider } from "@/context/SchoolContext";
import { PERMISSIONS } from "@/lib/permissions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useRoutePersistence } from "@/hooks/useRoutePersistence";
import { useGlobalDataSync } from "@/hooks/useGlobalDataSync";
import { SyncLoadingOverlay, PerformanceIndicator } from "@/components/ui/sync-loading-overlay";

function Router() {
  // Integrar hooks de persistência de rota e sincronização global
  useRoutePersistence();
  useGlobalDataSync();

  return (
    <Switch>
      {/* Rotas públicas */}
      <Route path="/login" component={Login} />
      <Route path="/auth" component={Login} />
      <Route path="/auth-test" component={LoginTest} />
      <Route path="/acesso-negado" component={AccessDenied} />
      <Route path="/teste-upload" component={TestUpload} />
      <Route path="/teste-usuario" component={TesteUsuarioPage} />
      <Route path="/teste-cadastro" component={TesteCadastroSimplificado} />
      
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
      
      {/* Rotas por papel do usuário */}
      <ProtectedRoute 
        path="/dashboard/aluno" 
        component={StudentDashboard}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/dashboard/professor" 
        component={TeacherDashboard}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/manager" 
        component={ManagerDashboardModerno}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/manager/classes" 
        component={ClassManagement}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/dashboard-gestor-moderno" 
        component={ManagerDashboardModerno}
        permissions={[
          PERMISSIONS.REPORT_SCHOOL_VIEW.id,
          PERMISSIONS.SCHOOL_CONFIG.id
        ]}
      />
      
      <ProtectedRoute 
        path="/manager-old" 
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
      
      <ProtectedRoute 
        path="/user-registration" 
        component={UserRegistrationSimple}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/usuarios" 
        component={UserManagement}
        permissions={[
          PERMISSIONS.USER_MANAGE_STUDENTS.id,
          PERMISSIONS.USER_MANAGE_TEACHERS.id
        ]}
      />
      
      <ProtectedRoute 
        path="/gerenciar-usuarios" 
        component={UserManagementAdvanced}
        permissions={[
          PERMISSIONS.USER_MANAGE_STUDENTS.id,
          PERMISSIONS.USER_MANAGE_TEACHERS.id
        ]}
      />
      
      <ProtectedRoute 
        path="/class-registration" 
        component={ClassRegistration}
        permissions={[
          PERMISSIONS.SCHOOL_CONFIG.id
        ]}
      />
      
      <ProtectedRoute 
        path="/class-list" 
        component={ClassListPage}
        permissions={[
          PERMISSIONS.SCHOOL_CONFIG.id
        ]}
      />
      
      <ProtectedRoute 
        path="/turmas" 
        component={ClassManagement}
        requireAuth={true}
      />
      
      <ProtectedRoute 
        path="/class-management" 
        component={ClassManagement}
        requireAuth={true}
      />
      
      {/* Sistema de Demonstração de Sincronização */}
      <ProtectedRoute 
        path="/sync-demo" 
        component={SyncDemo}
        requireAuth={true}
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
        <SchoolProvider>
          <GameProvider>
            <Router />
            <SyncLoadingOverlay showMetrics={true} />
            <PerformanceIndicator />
          </GameProvider>
        </SchoolProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
