
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { beginnerCourseData, intermediateCourseData, advancedCourseData, type Lesson, type Phrase } from '@/data/courseData';
import SpeechComponent from './SpeechComponent';
import { Volume2, ArrowRight, BookOpen, Brain, Award } from 'lucide-react';

interface QuizGameProps {
  lessonNumber: number;
  knownLanguage: string;
  targetLanguage: string;
  onLessonComplete: () => void;
  onBackToDashboard: () => void;
}

type QuestionType = 'multiple-choice' | 'speech' | 'translation' | 'listen-select';
type GamePhase = 'learning' | 'quiz' | 'complete';

interface Question {
  id: string;
  type: QuestionType;
  phrase: Phrase;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export default function QuizGame({ lessonNumber, knownLanguage, targetLanguage, onLessonComplete, onBackToDashboard }: QuizGameProps) {
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<GamePhase>('learning');
  const [learningPhraseIndex, setLearningPhraseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [masteredPhrases, setMasteredPhrases] = useState<Set<string>>(new Set());

  // Determine which course data to use based on lesson number
  const getCourseData = () => {
    if (lessonNumber >= 1 && lessonNumber <= 10) {
      return beginnerCourseData;
    } else if (lessonNumber >= 11 && lessonNumber <= 20) {
      return intermediateCourseData;
    } else if (lessonNumber >= 21 && lessonNumber <= 30) {
      return advancedCourseData;
    }
    return beginnerCourseData; // fallback
  };

  const courseData = getCourseData();
  const lesson: Lesson | undefined = courseData.lessons.find(l => l.lesson === lessonNumber);

  useEffect(() => {
    if (gamePhase === 'quiz' && lesson) {
      generateQuestions();
    }
  }, [gamePhase, lessonNumber, knownLanguage, lesson]);

  const generateQuestions = () => {
    if (!lesson) return;
    
    const questionTypes: QuestionType[] = ['multiple-choice', 'speech', 'translation', 'listen-select'];
    const generatedQuestions: Question[] = [];

    lesson.phrases.forEach((phrase, index) => {
      const type = questionTypes[index % questionTypes.length];
      
      switch (type) {
        case 'multiple-choice':
          generatedQuestions.push({
            id: phrase.id,
            type,
            phrase,
            question: `What does "${phrase.marathi}" mean?`,
            options: generateOptions(phrase, knownLanguage),
            correctAnswer: knownLanguage === 'hi' ? phrase.hindi : phrase.english
          });
          break;
          
        case 'listen-select':
          generatedQuestions.push({
            id: phrase.id,
            type,
            phrase,
            question: `Listen to the audio and select the correct translation:`,
            options: generateOptions(phrase, knownLanguage),
            correctAnswer: knownLanguage === 'hi' ? phrase.hindi : phrase.english
          });
          break;
          
        case 'speech':
          generatedQuestions.push({
            id: phrase.id,
            type,
            phrase,
            question: `Say this phrase in Marathi:`,
            correctAnswer: phrase.marathi
          });
          break;
          
        case 'translation':
          generatedQuestions.push({
            id: phrase.id,
            type,
            phrase,
            question: `Translate to ${targetLanguage}: "${phrase[knownLanguage]}`,
            correctAnswer: phrase.marathi
          });
          break;
      }
    });

    setQuestions(generatedQuestions);
  };

  const generateOptions = (correctPhrase: Phrase, lang: string): string[] => {
    if (!lesson) return [];
    
    const correct = lang === 'hi' ? correctPhrase.hindi : correctPhrase.english;
    const allPhrases = lesson.phrases.filter(p => p.id !== correctPhrase.id);
    const wrongOptions = allPhrases
      .slice(0, 3)
      .map(p => lang === 'hi' ? p.hindi : p.english);
    
    const options = [correct, ...wrongOptions];
    return options.sort(() => Math.random() - 0.5);
  };

  //All Language Code
  const languageCodeMap: Record<string, string> = {
    marathi: 'mr-IN',
    hindi: 'hi-IN',
    english: 'en-IN',
    gujarati: 'gu-IN',
    tamil: 'ta-IN',
    telugu: 'te-IN',
    bengali: 'bn-IN',
    kannada: 'kn-IN',
    malayalam: 'ml-IN',
  };

  const speakPhrase = (text: string, langKey: string) => {
    if (!text || typeof window === "undefined") return;
  
    const synth = window.speechSynthesis;
    synth.cancel(); // Stop any current speech

    const langCode = languageCodeMap[langKey] || 'en-IN';
  
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      synth.speak(utterance);
    }, 250); // Give it a slight delay to prevent instant cancellation
  };

  const handlePhraseMemorized = () => {
    if (!lesson) return;
    
    const currentPhrase : Phrase = lesson.phrases[learningPhraseIndex];
    setMasteredPhrases(prev => new Set([...prev, currentPhrase.id]));
    
    if (learningPhraseIndex < lesson.phrases.length - 1) {
      setLearningPhraseIndex(learningPhraseIndex + 1);
    } else {
      setGamePhase('quiz');
    }
  };

  const handleAnswer = (answer: string) => {
    setUserAnswer(answer);
    const correct = checkAnswer(answer);
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
      toast({
        title: "Excellent! 🎉",
        description: "You're doing great! Keep it up!",
      });
    } else {
      toast({
        title: "Not quite right 😅",
        description: "Don't worry, practice makes perfect!",
        variant: "destructive"
      });
    }
  };

  const checkAnswer = (answer: string): boolean => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    
    // For speech recognition, be more lenient with matching
    if (currentQuestion.type === 'speech') {
      const normalizedAnswer = answer.toLowerCase().trim();
      const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase().trim();
      return normalizedAnswer.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedAnswer);
    }
    
    return answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      setGamePhase('complete');
    }
  };

  const handleSpeechResult = (transcript: string, confidence: number) => {
    console.log('Speech result received:', transcript, confidence);
    handleAnswer(transcript);
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
            <p className="text-muted-foreground mb-4">
              Lesson {lessonNumber} is not available yet.
            </p>
            <Button onClick={onBackToDashboard}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Learning Phase
  if (gamePhase === 'learning') {
    const currentPhrase : Phrase= lesson.phrases[learningPhraseIndex];
    console.log(targetLanguage);
    
    const progress = ((learningPhraseIndex + 1) / lesson.phrases.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Mascot Hero */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <img 
                src="/assets/indianlingo.svg" 
                alt="Indian Lingo" 
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                Let's Learn!
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onBackToDashboard} className="hover:scale-105 transition-transform">
              ← Back
            </Button>
            <Badge variant="secondary" className="flex items-center gap-2 animate-scale-in">
              <BookOpen className="w-4 h-4" />
              Learning Phase
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Lesson {lesson.lesson}: {lesson.title}</span>
              <span>{Math.round(progress)}% Learned</span>
            </div>
            <Progress value={progress} className="h-3 transition-all duration-500" />
          </div>

          {/* Learning Card */}
          <Card className="shadow-xl animate-scale-in hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learn New Phrase
                </span>
                <span className="text-sm text-muted-foreground">
                  {learningPhraseIndex + 1} of {lesson.phrases.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Marathi Phrase */}
              <div className="text-center space-y-4">
                <div className="p-6 bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors duration-300">
                  <h2 className="text-4xl font-bold text-primary mb-4">{currentPhrase[targetLanguage]}</h2>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => speakPhrase(currentPhrase[targetLanguage],targetLanguage)}
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Volume2 className="w-5 h-5" />
                    Listen to Pronunciation
                  </Button>
                </div>
              </div>

              {/* Translation */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">Meaning:</h3>
                <p className="text-2xl font-semibold animate-fade-in">
                  {knownLanguage === 'hi' ? currentPhrase.hindi : currentPhrase.english}
                </p>
              </div>

              {/* Practice Section */}
              <div className="p-6 bg-accent/50 rounded-lg space-y-4 hover:bg-accent/60 transition-colors">
                <h4 className="font-semibold text-center">Practice Saying It:</h4>
                <div className="flex justify-center">
                  <SpeechComponent
                    targetText={currentPhrase.marathi}
                    onResult={(transcript) => {
                      toast({
                        title: "Great effort! 👏",
                        description: `You said: "${transcript}"`,
                      });
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => speakPhrase(currentPhrase[targetLanguage],targetLanguage)}
                  className="flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen Again
                </Button>
                <Button
                  onClick={handlePhraseMemorized}
                  className="gradient-primary text-white flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  Got it! Next Phrase
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {learningPhraseIndex === lesson.phrases.length - 1 && (
                <div className="text-center p-4 bg-success/10 border border-success/20 rounded-lg animate-pulse">
                  <p className="text-success font-semibold">
                    🎉 Ready for the quiz? Click "Got it!" to start testing your knowledge!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Complete Phase
  if (gamePhase === 'complete') {
    const percentage = Math.round((score / questions.length) * 100);
    const mascotImage = percentage >= 70 
      ? "/lovable-uploads/5ff72c1e-7607-4b1f-a99a-748a39247888.png" // Happy elephant
      : "/lovable-uploads/ba35d1c8-582c-4c8d-9c6d-283e5b38dfb4.png"; // Sad elephant

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img 
                src={mascotImage}
                alt={percentage >= 70 ? "Happy Lingo" : "Sad Lingo"}
                className="w-32 h-32 mx-auto animate-bounce-gentle"
              />
            </div>
            <CardTitle className="text-3xl font-bold animate-fade-in">
              {percentage >= 70 ? "Excellent Work! 🎉" : "Keep Practicing! 💪"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className={`text-6xl font-bold ${percentage >= 70 ? 'text-success' : 'text-warning'} animate-scale-in`}>
                {percentage}%
              </div>
              <p className="text-xl text-muted-foreground">
                You got {score} out of {questions.length} questions correct!
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-accent/50 rounded-lg hover:bg-accent/60 transition-colors">
                <div className="text-2xl font-bold">+{score * 10}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg hover:bg-accent/60 transition-colors">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Phrases Learned</div>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg hover:bg-accent/60 transition-colors">
                <div className="text-2xl font-bold">🔥</div>
                <div className="text-sm text-muted-foreground">Streak Active</div>
              </div>
            </div>

            {lesson.culture_tip && (
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg animate-fade-in">
                <h4 className="font-semibold mb-2">💡 Cultural Tip</h4>
                <p className="text-sm">{lesson.culture_tip}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onLessonComplete} 
                className="gradient-primary text-white hover:scale-105 transition-transform"
              >
                Continue to Next Lesson
              </Button>
              <Button 
                variant="outline" 
                onClick={onBackToDashboard}
                className="hover:scale-105 transition-transform"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Phase
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Quiz...</h2>
            <Button onClick={onBackToDashboard}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onBackToDashboard} className="hover:scale-105 transition-transform">
            ← Back
          </Button>
          <Badge variant="secondary" className="flex items-center gap-2 animate-scale-in">
            <Brain className="w-4 h-4" />
            Quiz Time - Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Lesson {lesson.lesson}: {lesson.title}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 transition-all duration-500" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl animate-scale-in hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{currentQuestion.type.replace('-', ' ').toUpperCase()}</Badge>
              <div className="text-sm text-muted-foreground">Score: {score}/{questions.length}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
              
              {(currentQuestion.type === 'speech' || currentQuestion.type === 'listen-select') && (
                <div className="p-4 bg-accent/50 rounded-lg hover:bg-accent/60 transition-colors">
                  <p className="text-xl font-semibold text-primary">
                    {knownLanguage === 'hi' ? currentQuestion.phrase.hindi : currentQuestion.phrase.english}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => speakPhrase(
                      currentQuestion.type === 'listen-select' 
                        ? currentQuestion.phrase.marathi 
                        : knownLanguage === 'hi' ? currentQuestion.phrase.hindi : currentQuestion.phrase.english
                    )}
                    className="mt-2 flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Volume2 className="w-4 h-4" />
                    Listen
                  </Button>
                </div>
              )}
            </div>

            {/* Answer Interface */}
            {!showFeedback && (
              <div className="space-y-4">
                {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'listen-select') && currentQuestion.options && (
                  <div className="grid gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-4 hover:bg-accent text-lg hover:scale-105 transition-all duration-300"
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'translation' && (
                  <div className="space-y-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="text-center text-lg p-4 focus:scale-105 transition-transform"
                      onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && handleAnswer(userAnswer)}
                    />
                    <Button
                      onClick={() => handleAnswer(userAnswer)}
                      disabled={!userAnswer.trim()}
                      className="w-full gradient-primary text-white hover:scale-105 transition-transform"
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}

                {currentQuestion.type === 'speech' && (
                  <SpeechComponent
                    targetText={currentQuestion.correctAnswer}
                    onResult={handleSpeechResult}
                  />
                )}
              </div>
            )}

            {/* Feedback */}
            {showFeedback && (
              <div className={`p-6 rounded-lg text-center animate-scale-in ${isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <div className="space-y-4">
                  <div className={`text-6xl animate-bounce-gentle ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                      {isCorrect ? 'Perfect!' : 'Not Quite Right'}
                    </h3>
                    {!isCorrect && (
                      <p className="text-muted-foreground mt-2">
                        Correct answer: <span className="font-semibold">{currentQuestion.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleNext} 
                    className="gradient-primary text-white hover:scale-105 transition-transform"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Lesson'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
