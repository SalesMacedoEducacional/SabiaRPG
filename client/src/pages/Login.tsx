import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Eye as EyeIcon, EyeOff as EyeOffIcon, ArrowLeft } from "lucide-react";
import { useStandardToast } from "@/lib/toast-utils";

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  rememberMe: z.boolean().optional()
});

// Esqueceu a senha - solicitar recuperação
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  recoveryMethod: z.enum(['email', 'sms']).default('email')
});

// Confirmar código de recuperação e definir nova senha
const resetPasswordSchema = z.object({
  code: z.string().min(6, { message: 'O código deve ter pelo menos 6 caracteres' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

// Registration form schema - extend from insertUserSchema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  role: z.enum(['student', 'teacher', 'manager']).default('student'),
  phone: z.string().min(10, { message: 'Telefone inválido' }).max(15),
  birthDate: z.string().refine(date => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  }, { message: 'Formato de data inválido (AAAA-MM-DD)' }),
  enrollment: z.string().min(3, { message: 'Número de matrícula é obrigatório' }),
  classId: z.string().min(1, { message: 'Selecione uma turma' }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

const Login: React.FC = () => {
  const { login, register, isAuthenticated } = useAuth();
  const toast = useStandardToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      phone: '',
      birthDate: '',
      enrollment: '',
      classId: '',
    }
  });
  
  // Forgot password form
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
      recoveryMethod: 'email'
    }
  });
  
  // Reset password form
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  // Estado para armazenar as turmas disponíveis
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  
  // Buscar as turmas disponíveis para o registro
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        } else {
          // Para fins de teste, incluímos algumas turmas simuladas
          setClasses([
            { id: "1", name: "1º Ano A" },
            { id: "2", name: "1º Ano B" },
            { id: "3", name: "2º Ano A" },
            { id: "4", name: "3º Ano A" }
          ]);
        }
      } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        // Para fins de teste, incluímos algumas turmas simuladas
        setClasses([
          { id: "1", name: "1º Ano A" },
          { id: "2", name: "1º Ano B" },
          { id: "3", name: "2º Ano A" },
          { id: "4", name: "3º Ano A" }
        ]);
      }
    };
    
    if (activeTab === 'register') {
      fetchClasses();
    }
  }, [activeTab]);
  
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      
      // Fazer requisição direta para o endpoint de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.password
        }),
      });

      const result = await response.json();

      if (response.ok && result.sucesso) {
        // Login bem-sucedido - redirecionar conforme o papel
        const userRole = result.usuario?.papel;
        const redirectPath = result.redirect;
        
        // Atualizar contexto de autenticação
        await login(data.email, data.password);
        
        // Redirecionar para o painel específico
        if (redirectPath) {
          setLocation(redirectPath);
        } else {
          // Fallback baseado no papel
          switch (userRole) {
            case 'aluno':
              setLocation('/dashboard/aluno');
              break;
            case 'professor':
              setLocation('/dashboard/professor');
              break;
            case 'gestor':
              setLocation('/manager');
              break;
            default:
              setLocation('/');
          }
        }
      } else {
        // Login falhou - exibir mensagem de erro específica
        const errorMessage = result.erro || 'Erro desconhecido';
        
        // Usar toast do sistema de UI para exibir erro
        const { toast } = await import('@/hooks/use-toast');
        toast({
          title: "Erro de Login",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar com o servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      // Garante que novos registros sejam sempre como 'student'
      registerData.role = 'student';
      await register(registerData);
      // O redirecionamento automático também será feito pelo ProtectedRoute
      setLocation('/');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sabia-login-bg flex items-center justify-center p-4">
      <div className="sabia-login-content max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <img 
              src="/assets/sabia-logo.png" 
              alt="Logomarca SABIÁ RPG" 
              className="sabia-login-logo logo logo-lg"
            />
          </div>
          <h1 className="font-medieval text-4xl text-accent mb-2">SABIÁ RPG</h1>
          <p className="text-parchment-dark">Embarque na jornada do conhecimento</p>
        </div>
        
        <Alert className="mb-4 border-accent bg-dark text-parchment">
          <InfoIcon className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent font-medieval">Usuários de Teste</AlertTitle>
          <AlertDescription>
            <div className="mt-2 text-sm space-y-1">
              <p><strong>Aluno:</strong> aluno@sabiarpg.edu.br / Senha@123</p>
              <p><strong>Professor:</strong> professor@sabiarpg.edu.br / Senha@123</p>
              <p><strong>Gestor:</strong> gestor@sabiarpg.edu.br / Senha@123</p>
              <p className="text-yellow-400 font-semibold">⚠️ Use exatamente: Senha@123</p>
            </div>
          </AlertDescription>
        </Alert>
        
        <Card className="sabia-login-card">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              {(activeTab === 'login' || activeTab === 'register') ? (
                <TabsList className="sabia-login-tabs grid grid-cols-2 w-full">
                  <TabsTrigger value="login" className="sabia-login-tab-trigger font-medieval">Entrar</TabsTrigger>
                  <TabsTrigger value="register" className="sabia-login-tab-trigger font-medieval">Registrar</TabsTrigger>
                </TabsList>
              ) : (
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="p-0 flex items-center text-accent hover:text-accent-dark"
                    onClick={() => setActiveTab('login')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Voltar</span>
                  </Button>
                  <h3 className="font-medieval text-lg text-accent">
                    {activeTab === 'forgot-password' ? 'Recuperar Senha' : 'Redefinir Senha'}
                  </h3>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="sabia-login-input"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Senha</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 text-accent text-xs"
                        onClick={() => setActiveTab('forgot-password')}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="sabia-login-input pr-10"
                        {...loginForm.register('password')}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dark hover:text-accent focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      {...loginForm.register('rememberMe')}
                    />
                    <Label htmlFor="rememberMe" className="text-sm">Lembrar-me</Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full sabia-login-button"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Carregando...' : 'Entrar'}
                  </Button>
                  
                  {/* Botões de OAuth removidos temporariamente */}
                </form>
              </TabsContent>
              
              <TabsContent value="forgot-password">
                <form 
                  onSubmit={forgotPasswordForm.handleSubmit((data) => {
                    setIsLoading(true);
                    // Simulação de envio de código de recuperação
                    setTimeout(() => {
                      setRecoveryEmail(data.email);
                      setShowResetPassword(true);
                      setActiveTab('reset-password');
                      toast({
                        title: "Código enviado",
                        description: `Um código de recuperação foi enviado para ${data.email} via ${data.recoveryMethod === 'email' ? 'email' : 'SMS'}`,
                      });
                      setIsLoading(false);
                    }, 1500);
                  })} 
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email">Email</Label>
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="sabia-login-input"
                      {...forgotPasswordForm.register('email')}
                    />
                    {forgotPasswordForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{forgotPasswordForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Método de recuperação</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="sabia-recovery-option flex items-center space-x-2">
                        <input
                          type="radio"
                          id="email-method"
                          value="email"
                          className="sabia-radio-input"
                          {...forgotPasswordForm.register('recoveryMethod')}
                          defaultChecked
                        />
                        <Label htmlFor="email-method" className="cursor-pointer">Email</Label>
                      </div>
                      <div className="sabia-recovery-option flex items-center space-x-2">
                        <input
                          type="radio"
                          id="sms-method"
                          value="sms"
                          className="sabia-radio-input"
                          {...forgotPasswordForm.register('recoveryMethod')}
                        />
                        <Label htmlFor="sms-method" className="cursor-pointer">SMS</Label>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent-dark text-dark font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar código de recuperação'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="reset-password">
                <form 
                  onSubmit={resetPasswordForm.handleSubmit((data) => {
                    setIsLoading(true);
                    // Simulação de redefinição de senha
                    setTimeout(() => {
                      toast({
                        title: "Senha redefinida",
                        description: "Sua senha foi redefinida com sucesso. Você já pode entrar com a nova senha.",
                      });
                      setActiveTab('login');
                      setIsLoading(false);
                    }, 1500);
                  })}
                  className="space-y-4"
                >
                  <p className="text-sm text-parchment-dark">
                    Um código de verificação foi enviado para <span className="font-medium text-accent">{recoveryEmail}</span>
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de verificação</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="Insira o código recebido"
                      className="sabia-login-input"
                      {...resetPasswordForm.register('code')}
                    />
                    {resetPasswordForm.formState.errors.code && (
                      <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.code.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="sabia-login-input pr-10"
                        {...resetPasswordForm.register('password')}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dark hover:text-accent focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {resetPasswordForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="sabia-login-input pr-10"
                        {...resetPasswordForm.register('confirmPassword')}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dark hover:text-accent focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {resetPasswordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{resetPasswordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent-dark text-dark font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="sabia-login-input"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário *</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Seu nome de usuário"
                      className="sabia-login-input"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      className="sabia-login-input"
                      {...registerForm.register('fullName')}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(99) 99999-9999"
                      className="sabia-login-input"
                      {...registerForm.register('phone')}
                    />
                    {registerForm.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      className="sabia-login-input"
                      {...registerForm.register('birthDate')}
                    />
                    {registerForm.formState.errors.birthDate && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.birthDate.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enrollment">Matrícula *</Label>
                    <Input
                      id="enrollment"
                      type="text"
                      placeholder="Número de matrícula"
                      className="sabia-login-input"
                      {...registerForm.register('enrollment')}
                    />
                    {registerForm.formState.errors.enrollment && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.enrollment.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="classId">Turma *</Label>
                    <select
                      id="classId"
                      className="w-full bg-dark border-primary text-parchment rounded h-10 px-3"
                      {...registerForm.register('classId')}
                    >
                      <option value="">Selecione uma turma</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    {registerForm.formState.errors.classId && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.classId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="sabia-login-input pr-10"
                        {...registerForm.register('password')}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dark hover:text-accent focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="sabia-login-input pr-10"
                        {...registerForm.register('confirmPassword')}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-dark hover:text-accent focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <p className="text-xs text-parchment-dark mt-2">* Todos os campos são obrigatórios</p>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent-dark text-dark font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Carregando...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
          
          <CardFooter className="flex justify-center">
            <p className="text-sm text-parchment-dark">
              Ao criar uma conta, você concorda com os nossos termos de serviço e política de privacidade.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;