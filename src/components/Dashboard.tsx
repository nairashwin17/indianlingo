
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { beginnerCourseData, intermediateCourseData, advancedCourseData } from '@/data/courseData';
import { BookOpen, Trophy, Flame, Target, Play, Lock, CheckCircle, Star, Award, Calendar } from 'lucide-react';

interface DashboardProps {
  knownLanguage: string;
  targetLanguage: string;
  onStartLesson: (lessonNumber: number) => void;
  onBackToLanguages: () => void;
}

export default function Dashboard({ knownLanguage, targetLanguage, onStartLesson, onBackToLanguages }: DashboardProps) {
  const [userProgress] = useState({
    totalXP: 0,
    currentLevel: 1,
    lessonsCompleted: 0,
    currentStreak: 0,
    todayGoalMet: false
  });

  const getLanguageName = (code: string) => {
    const langMap: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi',
      'mr': 'Marathi'
    };
    return langMap[code] || code;
  };

  const getLanguageFlag = (code: string) => {
    const flagMap: { [key: string]: string } = {
      'en': '🇺🇸',
      'hi': '🇮🇳',
      'mr': '🏛️'
    };
    return flagMap[code] || '🏳️';
  };

  // Combine all lessons from all levels
  const allLessons = [
    ...beginnerCourseData.lessons,
    ...intermediateCourseData.lessons,
    ...advancedCourseData.lessons
  ];

  const completionPercentage = (userProgress.lessonsCompleted / allLessons.length) * 100;
  const nextLevel = userProgress.currentLevel + 1;
  const xpForNextLevel = nextLevel * 500;
  const currentLevelProgress = ((userProgress.totalXP % 500) / 500) * 100;

  const getLessonLevel = (lessonNumber: number) => {
    if (lessonNumber >= 1 && lessonNumber <= 10) return 'Beginner';
    if (lessonNumber >= 11 && lessonNumber <= 20) return 'Intermediate';
    if (lessonNumber >= 21 && lessonNumber <= 30) return 'Advanced';
    return 'Beginner';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Welcome Message */}
        <div className="text-center space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back! 👋
              </h1>
              <div className="flex items-center justify-center md:justify-start space-x-3 text-lg text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span>{getLanguageFlag(knownLanguage)} {getLanguageName(knownLanguage)}</span>
                  <span>→</span>
                  <span>{getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}</span>
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={onBackToLanguages} className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Change Languages
            </Button>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-primary text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <div className="text-3xl font-bold">{userProgress.totalXP}</div>
              <div className="text-sm opacity-90">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-secondary text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <div className="text-3xl font-bold">Level {userProgress.currentLevel}</div>
              <div className="text-sm opacity-90">Current Level</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-accent text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <div className="text-3xl font-bold">{userProgress.currentStreak}</div>
              <div className="text-sm opacity-90">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <div className="text-3xl font-bold">{Math.round(completionPercentage)}%</div>
              <div className="text-sm opacity-90">Course Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Goal and Level Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Today's Goal</span>
              </CardTitle>
              <CardDescription>
                Complete 1 lesson to maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lessons completed today</span>
                  <Badge variant={userProgress.todayGoalMet ? "default" : "outline"}>
                    {userProgress.todayGoalMet ? "Goal Met! 🎉" : "0/1"}
                  </Badge>
                </div>
                <Progress value={userProgress.todayGoalMet ? 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Level Progress</span>
              </CardTitle>
              <CardDescription>
                {xpForNextLevel - userProgress.totalXP} XP to reach Level {nextLevel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Level {userProgress.currentLevel}</span>
                  <span>Level {nextLevel}</span>
                </div>
                <Progress value={currentLevelProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>Your Learning Path</span>
            </CardTitle>
            <CardDescription>
              {userProgress.lessonsCompleted} of {allLessons.length} lessons completed • 30 lessons across Beginner, Intermediate, and Advanced levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Course Progress</span>
                <span className="font-medium">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons Grid - Organized by Level */}
        <div className="space-y-8">
          {/* Beginner Lessons */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Beginner Level</h2>
              <Badge className="bg-green-500 text-white">Lessons 1-10</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {beginnerCourseData.lessons.map((lesson, index) => {
                const isCompleted = lesson.lesson <= userProgress.lessonsCompleted;
                const isCurrent = lesson.lesson === userProgress.lessonsCompleted + 1;
                const isLocked = lesson.lesson > userProgress.lessonsCompleted + 1;
                
                return (
                  <Card
                    key={lesson.lesson}
                    className={`transition-all duration-300 cursor-pointer group ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:shadow-xl hover:scale-105'
                    } ${
                      isCurrent ? 'ring-2 ring-primary shadow-xl bg-primary/5' : ''
                    } ${
                      isCompleted ? 'bg-success/5 border-success/30' : ''
                    }`}
                    onClick={() => !isLocked && onStartLesson(lesson.lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted
                              ? 'bg-success text-white'
                              : isCurrent
                              ? 'bg-primary text-white'
                              : isLocked
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                             isLocked ? <Lock className="w-4 h-4" /> : 
                             lesson.lesson}
                          </div>
                          
                          {isCurrent && (
                            <Badge className="bg-primary text-white text-xs">
                              <Play className="w-2 h-2 mr-1" />
                              Start
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm">Lesson {lesson.lesson}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{lesson.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Intermediate Lessons */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Intermediate Level</h2>
              <Badge className="bg-yellow-500 text-white">Lessons 11-20</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {intermediateCourseData.lessons.map((lesson, index) => {
                const isCompleted = lesson.lesson <= userProgress.lessonsCompleted;
                const isCurrent = lesson.lesson === userProgress.lessonsCompleted + 1;
                const isLocked = lesson.lesson > userProgress.lessonsCompleted + 1;
                
                return (
                  <Card
                    key={lesson.lesson}
                    className={`transition-all duration-300 cursor-pointer group ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:shadow-xl hover:scale-105'
                    } ${
                      isCurrent ? 'ring-2 ring-primary shadow-xl bg-primary/5' : ''
                    } ${
                      isCompleted ? 'bg-success/5 border-success/30' : ''
                    }`}
                    onClick={() => !isLocked && onStartLesson(lesson.lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted
                              ? 'bg-success text-white'
                              : isCurrent
                              ? 'bg-primary text-white'
                              : isLocked
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                             isLocked ? <Lock className="w-4 h-4" /> : 
                             lesson.lesson}
                          </div>
                          
                          {isCurrent && (
                            <Badge className="bg-primary text-white text-xs">
                              <Play className="w-2 h-2 mr-1" />
                              Start
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm">Lesson {lesson.lesson}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{lesson.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Advanced Lessons */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Advanced Level</h2>
              <Badge className="bg-red-500 text-white">Lessons 21-30</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {advancedCourseData.lessons.map((lesson, index) => {
                const isCompleted = lesson.lesson <= userProgress.lessonsCompleted;
                const isCurrent = lesson.lesson === userProgress.lessonsCompleted + 1;
                const isLocked = lesson.lesson > userProgress.lessonsCompleted + 1;
                
                return (
                  <Card
                    key={lesson.lesson}
                    className={`transition-all duration-300 cursor-pointer group ${
                      isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:shadow-xl hover:scale-105'
                    } ${
                      isCurrent ? 'ring-2 ring-primary shadow-xl bg-primary/5' : ''
                    } ${
                      isCompleted ? 'bg-success/5 border-success/30' : ''
                    }`}
                    onClick={() => !isLocked && onStartLesson(lesson.lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCompleted
                              ? 'bg-success text-white'
                              : isCurrent
                              ? 'bg-primary text-white'
                              : isLocked
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                             isLocked ? <Lock className="w-4 h-4" /> : 
                             lesson.lesson}
                          </div>
                          
                          {isCurrent && (
                            <Badge className="bg-primary text-white text-xs">
                              <Play className="w-2 h-2 mr-1" />
                              Start
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm">Lesson {lesson.lesson}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{lesson.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Achievement Showcase */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Your Achievements</span>
            </CardTitle>
            <CardDescription>
              Celebrating your learning milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <span className="text-3xl">🔥</span>
                <div>
                  <div className="font-bold text-yellow-800">Week Warrior</div>
                  <div className="text-sm text-yellow-600">7-day learning streak</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <span className="text-3xl">📖</span>
                <div>
                  <div className="font-bold text-green-800">First Steps</div>
                  <div className="text-sm text-green-600">Completed first lesson</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="font-bold text-blue-800">Quick Learner</div>
                  <div className="text-sm text-blue-600">100% lesson accuracy</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
