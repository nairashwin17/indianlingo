
import { useState } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import Dashboard from '@/components/Dashboard';
import QuizGame from '@/components/QuizGame';

type AppState = 'language-selection' | 'dashboard' | 'quiz';

export default function Index() {
  const [appState, setAppState] = useState<AppState>('language-selection');
  const [selectedLanguages, setSelectedLanguages] = useState({ known: '', target: '' });
  const [currentLesson, setCurrentLesson] = useState(1);

  const handleLanguageSelect = (known: string, target: string) => {
    setSelectedLanguages({ known, target });
    setAppState('dashboard');
  };

  const handleStartLesson = (lessonNumber: number) => {
    setCurrentLesson(lessonNumber);
    setAppState('quiz');
  };

  const handleLessonComplete = () => {
    setAppState('dashboard');
  };

  const handleBackToDashboard = () => {
    setAppState('dashboard');
  };

  const handleBackToLanguages = () => {
    setAppState('language-selection');
  };

  switch (appState) {
    case 'language-selection':
      return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
    
    case 'dashboard':
      return (
        <Dashboard
          knownLanguage={selectedLanguages.known}
          targetLanguage={selectedLanguages.target}
          onStartLesson={handleStartLesson}
          onBackToLanguages={handleBackToLanguages}
        />
      );
    
    case 'quiz':
      return (
        <QuizGame
          lessonNumber={currentLesson}
          knownLanguage={selectedLanguages.known}
          targetLanguage={selectedLanguages.target}
          onLessonComplete={handleLessonComplete}
          onBackToDashboard={handleBackToDashboard}
        />
      );
    
    default:
      return <LanguageSelector onLanguageSelect={handleLanguageSelect} />;
  }
}
