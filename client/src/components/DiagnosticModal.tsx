import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { generateDiagnosticRecommendation } from '@/lib/openai';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface Question {
  id: number;
  question: string;
  area: string;
  options: string[];
  correctAnswer: number;
  difficulty: number;
}

const areas = [
  { id: 'mathematics', label: 'Matemática' },
  { id: 'languages', label: 'Linguagens' },
  { id: 'sciences', label: 'Ciências' },
  { id: 'history', label: 'História' },
  { id: 'geography', label: 'Geografia' },
  { id: 'arts', label: 'Artes' },
];

const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Verificar se o usuário é professor ou gestor
  // Nesse caso, não deve mostrar a triagem diagnóstica
  const isTeacherOrManager = user?.role === 'teacher' || user?.role === 'manager';
  
  // Se for professor ou gestor, fechamos o modal e completamos imediatamente
  useEffect(() => {
    if (isOpen && isTeacherOrManager) {
      // Marcamos a triagem como completa no localStorage para esse usuário
      localStorage.setItem('diagnostic_completed', 'true');
      // Fechamos o modal
      onComplete();
      onClose();
      
      // Mostrar toast informativo
      toast({
        title: "Triagem ignorada",
        description: "Professores e gestores não precisam passar pela triagem diagnóstica.",
      });
    }
  }, [isOpen, isTeacherOrManager, onComplete, onClose, toast]);
  
  const [currentArea, setCurrentArea] = useState('mathematics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [isDiagnosticComplete, setIsDiagnosticComplete] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, { score: number; difficulty: number }>>({});
  const [recommendation, setRecommendation] = useState<string>('');
  
  // Fetch diagnostic questions by area
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['/api/diagnostic-questions', { area: currentArea }],
    queryFn: () => fetch(`/api/diagnostic-questions?area=${currentArea}`).then(res => res.json()),
    enabled: isOpen && !isDiagnosticComplete,
  });
  
  // Submit diagnostic results mutation
  const submitDiagnosticMutation = useMutation({
    mutationFn: async (areaData: { area: string; score: number; recommendedDifficulty: number }) => {
      const response = await apiRequest('POST', '/api/user-diagnostics', {
        userId: user?.id,
        ...areaData
      });
      return response.json();
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o diagnóstico',
        variant: 'destructive',
      });
    }
  });
  
  // Calculate current question
  const currentQuestion = questions[currentQuestionIndex] as Question | undefined;
  
  // Calculate progress
  const totalAreas = areas.length;
  const currentAreaIndex = areas.findIndex(area => area.id === currentArea);
  const totalProgress = ((currentAreaIndex * 100) + (currentQuestionIndex * (100 / questions.length))) / totalAreas;
  
  // Handle answer selection
  const selectAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };
  
  // Handle navigation
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentAreaIndex > 0) {
      setCurrentArea(areas[currentAreaIndex - 1].id);
      setCurrentQuestionIndex(0);
    }
  };
  
  const goToNextQuestion = () => {
    // Check if user has answered current question
    if (currentQuestion && answers[currentQuestion.id] === undefined) {
      toast({
        title: 'Atenção',
        description: 'Por favor, selecione uma resposta antes de continuar',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question in current area
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentAreaIndex < areas.length - 1) {
      // Calculate score for current area
      calculateAreaScore();
      
      // Move to next area
      setCurrentArea(areas[currentAreaIndex + 1].id);
      setCurrentQuestionIndex(0);
    } else {
      // Calculate score for final area
      calculateAreaScore();
      
      // Complete diagnostic
      setIsDiagnosticComplete(true);
    }
  };
  
  // Calculate score for current area
  const calculateAreaScore = () => {
    const areaQuestions = Array.isArray(questions) ? questions : [];
    if (areaQuestions.length === 0) return;
    
    let correctAnswers = 0;
    let totalQuestions = areaQuestions.length;
    
    // Usando loop for em vez de forEach para garantir que funcione
    for (let i = 0; i < areaQuestions.length; i++) {
      const question = areaQuestions[i] as Question;
      if (question && answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    let recommendedDifficulty = 1;
    
    if (score >= 80) recommendedDifficulty = 3;
    else if (score >= 50) recommendedDifficulty = 2;
    else recommendedDifficulty = 1;
    
    // Save diagnostic result
    setDiagnosticResults(prev => ({
      ...prev,
      [currentArea]: { score, difficulty: recommendedDifficulty }
    }));
    
    // Submit to API
    submitDiagnosticMutation.mutate({
      area: currentArea,
      score,
      recommendedDifficulty
    });
  };
  
  // Generate recommendation when diagnostic is complete
  useEffect(() => {
    if (isDiagnosticComplete && Object.keys(diagnosticResults).length > 0) {
      // Get overall score
      const areas = Object.keys(diagnosticResults);
      const totalScore = areas.reduce((sum, area) => sum + diagnosticResults[area].score, 0);
      const averageScore = Math.round(totalScore / areas.length);
      
      // Generate recommendation using OpenAI
      generateDiagnosticRecommendation({
        area: 'overall',
        score: averageScore,
        answers: Object.entries(answers).map(([id, answer]) => ({ id, answer }))
      }).then(recommendation => {
        setRecommendation(recommendation);
      });
    }
  }, [isDiagnosticComplete, diagnosticResults, answers]);
  
  // Handle completion
  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-light border-primary sm:max-w-xl">
        <DialogHeader className="border-b border-primary pb-4">
          <div className="flex items-center">
            <DialogTitle className="font-medieval text-xl text-accent">
              {isDiagnosticComplete ? 'Diagnóstico Concluído' : 'Triagem Diagnóstica'}
            </DialogTitle>
            {!isDiagnosticComplete && (
              <div className="ml-auto">
                <span className="text-sm text-parchment-dark">
                  {currentAreaIndex + 1}/{totalAreas} • Questão {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
            )}
          </div>
          {!isDiagnosticComplete && (
            <Progress value={totalProgress} className="h-2 mt-4" />
          )}
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
          </div>
        ) : isDiagnosticComplete ? (
          <div className="py-6 space-y-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="font-cinzel text-2xl text-parchment mb-2">Diagnóstico Concluído!</h3>
              <p className="text-parchment-dark">
                Obrigado por completar a avaliação diagnóstica. Suas trilhas de aprendizado foram personalizadas com base em suas respostas.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-cinzel text-lg text-accent">Resultados por Área:</h4>
              
              {Object.entries(diagnosticResults).map(([area, { score }]) => {
                const areaLabel = areas.find(a => a.id === area)?.label || area;
                return (
                  <div key={area} className="space-y-1">
                    <div className="flex justify-between">
                      <span>{areaLabel}</span>
                      <span>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </div>
            
            <Separator className="bg-primary" />
            
            <div className="space-y-2">
              <h4 className="font-cinzel text-lg text-accent">Recomendação:</h4>
              <p className="text-parchment-light italic border-l-4 border-primary-light pl-4 py-2">
                {recommendation || 'Gerando recomendação personalizada...'}
              </p>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="py-6">
            <div className="mb-6">
              <h3 className="font-cinzel text-lg text-parchment mb-2">
                {areas.find(area => area.id === currentArea)?.label}
              </h3>
              <p className="text-parchment-light">{currentQuestion.question}</p>
            </div>
            
            <RadioGroup 
              value={answers[currentQuestion.id]?.toString() || ''} 
              onValueChange={(value) => selectAnswer(currentQuestion.id, parseInt(value))}
              className="space-y-2"
            >
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 bg-dark rounded-lg border border-primary hover:border-accent cursor-pointer transition duration-150"
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    className="text-accent border-primary"
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="ml-3 flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div className="py-6 text-center text-parchment-dark">
            Nenhuma questão disponível para esta área
          </div>
        )}
        
        <DialogFooter className="flex justify-between mt-6">
          {isDiagnosticComplete ? (
            <Button 
              onClick={handleComplete} 
              className="bg-accent hover:bg-accent-dark text-dark ml-auto"
            >
              Iniciar Aventura
            </Button>
          ) : (
            <>
              <Button 
                onClick={goToPreviousQuestion} 
                variant="outline" 
                className="border-primary"
                disabled={currentQuestionIndex === 0 && currentAreaIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button 
                onClick={goToNextQuestion} 
                className="bg-accent hover:bg-accent-dark text-dark"
              >
                {currentQuestionIndex < questions.length - 1 || currentAreaIndex < areas.length - 1 ? (
                  <>
                    Próxima
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Concluir'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiagnosticModal;
