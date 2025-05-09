import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { generateFeedback } from '@/lib/openai';
import { 
  ChevronLeft,
  ChevronRight,
  Trophy,
  Clock,
  AlertTriangle,
  Star,
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

const MissionPage: React.FC = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { missions, userProgress, startMission, completeMission } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  // Get mission by ID
  const missionId = parseInt(id);
  const mission = missions.find(m => m.id === missionId);
  const progress = userProgress.find(p => p.missionId === missionId);
  
  // Initialize answers when mission changes
  useEffect(() => {
    if (mission && progress?.completed) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
      setAnswers({});
      setCurrentStep(0);
      setFeedback(null);
    }
    
    // Start mission when page loads
    if (mission && !isComplete) {
      startMission(missionId);
    }
  }, [mission, progress]);
  
  if (!mission || !user) {
    return (
      <div className="min-h-screen bg-dark">
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-medieval text-accent mb-4">Missão não encontrada</h1>
          <p className="text-parchment-dark mb-8">A missão que você está procurando não existe ou não está disponível.</p>
          <Button onClick={() => setLocation('/')} className="bg-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao mapa
          </Button>
        </div>
      </div>
    );
  }
  
  // Get steps from mission content
  const steps = mission.content?.steps || [];
  const currentStepData = steps[currentStep];
  
  // Get area label
  const getAreaLabel = (area: string) => {
    switch (area) {
      case 'mathematics': return 'Matemática';
      case 'languages': return 'Linguagens';
      case 'sciences': return 'Ciências';
      case 'history': return 'História';
      case 'geography': return 'Geografia';
      case 'arts': return 'Artes';
      default: return area;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  
  // Handle answer change
  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentStep]: value
    }));
  };
  
  // Handle navigation
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setFeedback(null);
    }
  };
  
  const goToNextStep = () => {
    // Validate current step
    if (!answers[currentStep]) {
      toast({
        title: "Resposta necessária",
        description: "Por favor, responda a questão antes de continuar.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is the last step
    if (currentStep === steps.length - 1) {
      handleSubmitMission();
    } else {
      // Move to next step
      setCurrentStep(prev => prev + 1);
      setFeedback(null);
    }
  };
  
  // Handle mission submission
  const handleSubmitMission = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score based on answers
      // In a real implementation, this would check against correct answers
      const totalQuestions = steps.length;
      const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1)); // Mock: random correct answers
      const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
      
      setScore(calculatedScore);
      
      // Generate AI feedback
      const missionFeedback = await generateFeedback({
        progress: {
          score: calculatedScore,
          attempts: progress ? progress.attempts : 1
        },
        missionContent: {
          title: mission.title,
          description: mission.description,
          area: mission.area
        },
        userAnswers: answers
      });
      
      setFeedback(missionFeedback);
      
      // Complete mission
      await completeMission(missionId, calculatedScore);
      
      setIsComplete(true);
    } catch (error) {
      console.error('Error submitting mission:', error);
      toast({
        title: "Erro ao completar missão",
        description: "Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle go back to map
  const handleBackToMap = () => {
    setLocation('/');
  };
  
  // Render question based on type
  const renderQuestion = () => {
    if (!currentStepData) return null;
    
    switch (currentStepData.type) {
      case 'multiple_choice':
        return (
          <RadioGroup 
            value={answers[currentStep]?.toString() || ''} 
            onValueChange={(value) => handleAnswerChange(value)}
            className="space-y-2 mt-4"
          >
            {currentStepData.options.map((option: string, index: number) => (
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
        );
      
      case 'text':
        return (
          <Textarea
            placeholder="Digite sua resposta aqui..."
            className="mt-4 bg-dark border-primary text-parchment"
            value={answers[currentStep] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={5}
          />
        );
      
      default:
        return (
          <Alert className="mt-4 bg-dark border-primary">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Tipo de questão não suportado</AlertTitle>
            <AlertDescription>
              Este tipo de questão não está disponível no momento.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="border-primary mb-4"
            onClick={handleBackToMap}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Mapa
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-3xl font-medieval text-accent">{mission.title}</h1>
              <div className="flex items-center mt-2">
                <Badge className={`
                  ${mission.area === 'mathematics' ? 'bg-secondary' : 
                    mission.area === 'languages' ? 'bg-accent' : 
                    mission.area === 'sciences' ? 'bg-blue-500' : 
                    mission.area === 'history' ? 'bg-red-600' : 
                    mission.area === 'geography' ? 'bg-green-500' : 
                    mission.area === 'arts' ? 'bg-purple-500' : 'bg-primary'} 
                  ${mission.area === 'mathematics' || mission.area === 'languages' ? 'text-dark' : 'text-white'}
                  mr-2
                `}>
                  {getAreaLabel(mission.area)}
                </Badge>
                
                <div className="flex items-center text-parchment-dark text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{mission.estimatedTime} min</span>
                </div>
                
                <div className="flex items-center text-parchment-dark text-sm ml-4">
                  <Star className="h-4 w-4 mr-1 text-accent" />
                  <span>{mission.xpReward} XP</span>
                </div>
              </div>
            </div>
            
            {isComplete && (
              <div className="flex items-center mt-4 md:mt-0">
                <Badge className="bg-accent text-dark p-2">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>{score}% concluído</span>
                </Badge>
              </div>
            )}
          </div>
          
          {!isComplete && (
            <>
              <Progress value={progressPercentage} className="h-2 my-4" />
              <div className="flex justify-between text-sm text-parchment-dark">
                <span>Passo {currentStep + 1} de {steps.length}</span>
                <span>{Math.round(progressPercentage)}% concluído</span>
              </div>
            </>
          )}
        </div>
        
        {isComplete ? (
          <Card className="bg-dark-light border-primary max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-accent mr-2" />
                Missão Concluída!
              </CardTitle>
              <CardDescription>
                Você completou a missão com sucesso e ganhou {mission.xpReward} pontos de experiência!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="w-full">
                  <div className="flex justify-between mb-1">
                    <span>Pontuação</span>
                    <span>{score}%</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              </div>
              
              {feedback && (
                <div className="mt-6">
                  <h3 className="font-cinzel text-lg text-accent mb-2">Feedback do Sábio</h3>
                  <div className="bg-dark p-4 rounded-lg border border-primary">
                    <p className="italic text-parchment">{feedback}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-primary"
                onClick={handleBackToMap}
              >
                Voltar ao Mapa
              </Button>
              
              <Button 
                className="bg-accent text-dark hover:bg-accent-dark"
                onClick={() => {
                  // Reset state and restart mission
                  setIsComplete(false);
                  setAnswers({});
                  setCurrentStep(0);
                  setFeedback(null);
                  startMission(missionId);
                }}
              >
                Tentar Novamente
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-dark-light border-primary max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>{currentStepData?.title || 'Questão'}</CardTitle>
              <CardDescription>
                {currentStepData?.description || 'Responda a questão abaixo para avançar na missão.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderQuestion()}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-primary"
                onClick={goToPreviousStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              <Button 
                className="bg-accent text-dark hover:bg-accent-dark"
                onClick={goToNextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark mr-2"></div>
                    Processando...
                  </div>
                ) : currentStep === steps.length - 1 ? (
                  'Concluir Missão'
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MissionPage;
