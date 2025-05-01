import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import TeacherDashboard from "@/pages/TeacherDashboard";
import MissionPage from "@/pages/MissionPage";
import Forum from "@/pages/Forum";
import RankingPage from "@/pages/RankingPage";
import UserProfile from "@/pages/UserProfile";
import { useAuth } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import { useEffect, FC } from "react";
import { RouteComponentProps } from "wouter";

// Define types for ProtectedRoute
interface ProtectedRouteProps {
  component: FC<any>;
  requiredRoles?: string[];
  params?: any;
  [key: string]: any;
}

function ProtectedRoute({ component: Component, requiredRoles, ...rest }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && user && user.role && !requiredRoles.includes(user.role as string)) {
    return <NotFound />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} requiredRoles={["student", "teacher", "manager"]} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={UserProfile} requiredRoles={["student", "teacher", "manager"]} />} />
      <Route path="/mission/:id" component={(params) => <ProtectedRoute component={MissionPage} params={params} requiredRoles={["student", "teacher", "manager"]} />} />
      <Route path="/forum" component={() => <ProtectedRoute component={Forum} requiredRoles={["student", "teacher", "manager"]} />} />
      <Route path="/ranking" component={() => <ProtectedRoute component={RankingPage} requiredRoles={["student", "teacher", "manager"]} />} />
      <Route path="/teacher" component={() => <ProtectedRoute component={TeacherDashboard} requiredRoles={["teacher", "manager"]} />} />
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
