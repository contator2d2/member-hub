import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Trophy,
  Award,
  Flame,
  Clock,
  Play,
  ChevronRight,
} from 'lucide-react';

// Mock data
const mockStats = {
  enrolledCourses: 8,
  completedCourses: 3,
  totalWatchTime: 45,
  currentStreak: 12,
  totalBadges: 7,
  totalCertificates: 3,
  points: 2450,
};

const mockContinueLearning = [
  { id: '1', title: 'Marketing Digital Avançado', progress: 65, nextLesson: 'Estratégias de SEO' },
  { id: '2', title: 'Liderança e Gestão', progress: 40, nextLesson: 'Comunicação Assertiva' },
  { id: '3', title: 'Finanças Pessoais', progress: 25, nextLesson: 'Investimentos Básicos' },
];

const mockBadges = [
  { id: '1', name: 'Primeiro Passo', icon: '🎯', description: 'Complete sua primeira aula' },
  { id: '2', name: 'Streak Master', icon: '🔥', description: '7 dias consecutivos' },
  { id: '3', name: 'Conhecimento', icon: '📚', description: 'Complete um curso' },
];

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Continue de onde parou
          </p>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full">
          <Flame className="h-5 w-5" />
          <span className="font-bold">{mockStats.currentStreak} dias</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos em Andamento</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.enrolledCourses - mockStats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.completedCourses} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalWatchTime}h</div>
            <p className="text-xs text-muted-foreground">total assistido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalBadges}</div>
            <p className="text-xs text-muted-foreground">badges conquistados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">conquistados</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Continue Aprendendo</CardTitle>
            <CardDescription>Seus cursos em andamento</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/courses">
              Ver todos
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockContinueLearning.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Próxima: {course.nextLesson}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={course.progress} className="h-2 flex-1" />
                    <span className="text-xs font-medium text-muted-foreground w-10">
                      {course.progress}%
                    </span>
                  </div>
                </div>
                <Button size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Continuar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Conquistas Recentes</CardTitle>
            <CardDescription>Suas últimas badges conquistadas</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/achievements">
              Ver todas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center text-center p-4 rounded-lg border border-border flex-1"
              >
                <span className="text-4xl mb-2">{badge.icon}</span>
                <h4 className="font-medium text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
