
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface Language {
  code: string;
  name: string;
  flag: string;
  available?: boolean;
}

const knownLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', available: true },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', available: true },
];

const targetLanguages: Language[] = [
  { code: 'mr', name: 'Marathi', flag: '🏛️', available: true },
  { code: 'kn', name: 'Kannada', flag: '🌺', available: false },
  { code: 'ta', name: 'Tamil', flag: '🕉️', available: false },
  { code: 'te', name: 'Telugu', flag: '💎', available: false },
  { code: 'ml', name: 'Malayalam', flag: '', available: false },
  { code: 'gu', name: 'Gujarati', flag: '🦚', available: false },
  { code: 'bn', name: 'Bengali', flag: '🎨', available: false },
];

interface LanguageSelectorProps {
  onLanguageSelect: (known: string, target: string) => void;
}

export default function LanguageSelector({ onLanguageSelect }: LanguageSelectorProps) {
  const [selectedKnown, setSelectedKnown] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  const handleStart = () => {
    if (selectedKnown && selectedTarget) {
      onLanguageSelect(selectedKnown, selectedTarget);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="lingo-logo">
            <img src="/assets/indianlingo.svg" alt="Indian Lingo" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Welcome to IndianLingo
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your journey learning Indian languages with our interactive, gamified experience.
            Choose your languages below to begin!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Known Language Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">I know:</h3>
              <div className="grid gap-3">
                {knownLanguages.map((lang) => (
                  <Card
                    key={lang.code}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedKnown === lang.code
                      ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                      : 'hover:bg-accent/50'
                      }`}
                    onClick={() => setSelectedKnown(lang.code)}
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <span className="text-3xl">{lang.flag}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{lang.name}</h4>
                      </div>
                      {selectedKnown === lang.code && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Target Language Selection */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">I want to learn:</h3>
              <div className="grid gap-3">
                {targetLanguages.map((lang) => (
                  <Card
                    key={lang.code}
                    className={`cursor-pointer transition-all duration-200 ${lang.available
                      ? `hover:shadow-md ${selectedTarget === lang.code
                        ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                        : 'hover:bg-accent/50'
                      }`
                      : 'opacity-50 cursor-not-allowed'
                      }`}
                    onClick={() => lang.available && setSelectedTarget(lang.code)}
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <span className="text-3xl">{lang.flag}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{lang.name}</h4>
                        {!lang.available && (
                          <Badge variant="secondary" className="mt-1">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      {selectedTarget === lang.code && lang.available && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              onClick={handleStart}
              disabled={!selectedKnown || !selectedTarget}
              className="px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gradient-primary text-white border-0"
            >
              Start Learning Journey 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}