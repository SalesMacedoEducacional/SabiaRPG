import React, { useState, useEffect } from 'react';

const LoginTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Verificar usuário atual ao carregar a página
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        setLoginStatus('Usuário autenticado');
      } else {
        setCurrentUser(null);
        setLoginStatus('Não autenticado');
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setLoginStatus('Erro ao verificar usuário');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLoginStatus('Login bem-sucedido!');
        setCurrentUser(data);
      } else {
        setLoginStatus(`Erro: ${data.message || 'Falha no login'}`);
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setLoginStatus('Erro durante o login');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      if (response.ok) {
        setCurrentUser(null);
        setLoginStatus('Logout realizado com sucesso');
      } else {
        setLoginStatus('Erro ao fazer logout');
      }
    } catch (error) {
      console.error('Erro durante logout:', error);
      setLoginStatus('Erro durante o logout');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">SABIÁ RPG - Teste de Login</h1>
      
      {currentUser ? (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Usuário Autenticado</h2>
          <div className="mb-2">
            <span className="font-semibold">ID:</span> {currentUser.id}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Email:</span> {currentUser.email}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Papel:</span> {currentUser.papel}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="bg-gray-100 p-4 rounded">
          <div className="mb-4">
            <label className="block mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Senha:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      )}
      
      {loginStatus && (
        <div className={`mt-4 p-3 rounded ${
          loginStatus.includes('sucesso') || loginStatus.includes('autenticado') 
            ? 'bg-green-100' 
            : loginStatus.includes('Erro') 
              ? 'bg-red-100' 
              : 'bg-yellow-100'
        }`}>
          <p>{loginStatus}</p>
        </div>
      )}
      
      <div className="mt-4 bg-blue-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Usuários para Teste</h2>
        <ul className="list-disc pl-5">
          <li><strong>Gestor:</strong> gestor@sabiarpg.edu.br / Senha@123</li>
          <li><strong>Professor:</strong> professor@sabiarpg.edu.br / Senha@123</li>
          <li><strong>Aluno:</strong> aluno@sabiarpg.edu.br / Senha@123</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginTest;