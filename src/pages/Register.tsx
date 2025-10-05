import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: role selection, 2: personal info, 3: account creation
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = () => {
    setStep(2);
  };

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setStep(3);
    setError('');
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        navigate('/chat');
      } else {
        // Email confirmation required
        navigate('/login', { 
          state: { 
            message: 'Verifique seu e-mail para confirmar a conta.' 
          } 
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Enem AI</h1>
            <p className="text-gray-400">
              {step === 1 && 'Selecione seu papel'}
              {step === 2 && 'Informe seus dados pessoais'}
              {step === 3 && 'Crie sua conta'}
            </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">Você é:</h2>
                <div className="flex flex-col space-y-4">
                  <div 
                    className={`flex items-center space-x-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      role === 'student' 
                        ? 'bg-purple-600 scale-[1.02]' 
                        : 'bg-gray-700 hover:bg-gray-600 hover:scale-[1.02]'
                    }`}
                    onClick={() => setRole('student')}
                  >
                    <div className="text-white flex-1">
                      <div className="flex items-center">
                        <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg">🎓</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Estudante</div>
                          <div className="text-sm text-gray-200">Preparando-se para o ENEM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-2 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      role === 'teacher' 
                        ? 'bg-purple-600 scale-[1.02]' 
                        : 'bg-gray-700 hover:bg-gray-600 hover:scale-[1.02]'
                    }`}
                    onClick={() => setRole('teacher')}
                  >
                    <div className="text-white flex-1">
                      <div className="flex items-center">
                        <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg">👨‍🏫</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Professor</div>
                          <div className="text-sm text-gray-200">Ensina para o ENEM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleRoleSelect}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">Primeiro Nome *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Seu primeiro nome"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-gray-300">Último Nome *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Seu último nome"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continuar
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleAccountCreation} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-300">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-gray-300">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                    placeholder="Repita sua senha"
                    required
                  />
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      {role === 'student' ? '🎓' : '👨‍🏫'}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {role === 'student' ? 'Estudante' : 'Professor'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {firstName} {lastName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Já tem uma conta? Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;