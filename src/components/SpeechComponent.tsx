
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechComponentProps {
  targetText: string;
  onResult: (transcript: string, confidence: number) => void;
}

export default function SpeechComponent({ targetText, onResult }: SpeechComponentProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const startListening = () => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'mr-IN'; // Marathi language code

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0];
      const transcript = result.transcript;
      const confidence = result.confidence || 0.5;
      
      console.log('Speech result:', transcript, 'Confidence:', confidence);
      setTranscript(transcript);
      onResult(transcript, confidence);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = () => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(targetText);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.7;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        console.log('Speech synthesis started');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      console.log('Speaking:', targetText);
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg animate-fade-in">
        <p className="text-muted-foreground">Speech recognition is not supported in this browser.</p>
        <p className="text-sm text-muted-foreground mt-2">Try using Chrome or Edge for the best experience.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={speakText}
          disabled={isSpeaking}
          className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
            isSpeaking ? 'animate-pulse bg-primary/10' : ''
          }`}
        >
          <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
          {isSpeaking ? 'Speaking...' : 'Listen'}
        </Button>
        
        <Button
          variant={isListening ? "destructive" : "default"}
          size="lg"
          onClick={startListening}
          disabled={isListening}
          className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
            isListening ? 'animate-pulse' : ''
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 animate-pulse" />
              Listening...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Record
            </>
          )}
        </Button>
      </div>
      
      {transcript && (
        <div className="p-3 bg-accent rounded-lg text-center animate-scale-in">
          <p className="text-sm text-muted-foreground">You said:</p>
          <p className="font-semibold">{transcript}</p>
        </div>
      )}
    </div>
  );
}
