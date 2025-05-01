import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  rememberMe: z.boolean().optional()
});

// Registration form schema - extend from insertUserSchema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  role: z.enum(['student', 'teacher', 'manager']).default('student')
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

const Login: React.FC = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
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
      role: 'student'
    }
  });
  
  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      setLocation('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      setLocation('/');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <svg 
              width="60" 
              height="60" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-accent"
            >
              <path 
                d="M10 30L20 10L30 30L20 25L10 30Z" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="2"
              />
              <circle 
                cx="20" 
                cy="15" 
                r="5" 
                fill="currentColor" 
                stroke="currentColor"
              />
            </svg>
          </div>
          <h1 className="font-medieval text-4xl text-accent mb-2">SABIÁ RPG</h1>
          <p className="text-parchment-dark">Embarque na jornada do conhecimento</p>
        </div>
        
        <Card className="bg-dark-light border-primary">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid grid-cols-2 w-full bg-dark">
                <TabsTrigger value="login" className="font-medieval">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="font-medieval">Registrar</TabsTrigger>
              </TabsList>
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
                      className="bg-dark border-primary text-parchment"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Senha</Label>
                      <Button type="button" variant="link" className="px-0 text-accent text-xs">
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-dark border-primary text-parchment"
                      {...loginForm.register('password')}
                    />
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
                    className="w-full bg-accent hover:bg-accent-dark text-dark font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Carregando...' : 'Entrar'}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-primary"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-dark-light text-parchment-dark">Ou continue com</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="w-full border-primary bg-dark">
                      <i className="fab fa-google text-lg mr-2"></i>
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-primary bg-dark">
                      <i className="fab fa-microsoft text-lg mr-2"></i>
                      Microsoft
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-dark border-primary text-parchment"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Seu nome de usuário"
                      className="bg-dark border-primary text-parchment"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      className="bg-dark border-primary text-parchment"
                      {...registerForm.register('fullName')}
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-dark border-primary text-parchment"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-dark border-primary text-parchment"
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
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