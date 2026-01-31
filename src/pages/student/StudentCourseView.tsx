import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  Star,
  Play,
  Lock,
} from 'lucide-react';
import { CourseModule } from '@/components/student/LessonItem';
import { UpsellSection, UpsellCompact } from '@/components/student/UpsellSection';

// Mock data
const mockCourse = {
  id: '1',
  title: 'Marketing Digital Avançado',
  description: 'Aprenda as estratégias mais avançadas de marketing digital para alavancar seu negócio.',
  thumbnail: '/placeholder.svg',
  instructor: 'João Silva',
  rating: 4.9,
  studentsCount: 1280,
  duration: 480,
  modulesCount: 8,
  lessonsCount: 45,
  progress: 35,
  enrollmentDate: '2025-01-15',
};

const mockModules = [
  {
    id: 'm1',
    title: 'Introdução ao Marketing Digital',
    lessons: [
      { id: 'l1', title: 'Boas-vindas ao curso', duration: 5, type: 'video' as const, dripType: 'immediate' as const, completed: true },
      { id: 'l2', title: 'O que é Marketing Digital?', duration: 15, type: 'video' as const, dripType: 'immediate' as const, completed: true },
      { id: 'l3', title: 'História e Evolução', duration: 10, type: 'text' as const, dripType: 'immediate' as const, completed: false },
    ],
  },
  {
    id: 'm2',
    title: 'Estratégias de SEO',
    lessons: [
      { id: 'l4', title: 'Fundamentos de SEO', duration: 20, type: 'video' as const, dripType: 'days_after_enrollment' as const, dripDays: 7, completed: false },
      { id: 'l5', title: 'Palavras-chave', duration: 25, type: 'video' as const, dripType: 'days_after_enrollment' as const, dripDays: 10, completed: false },
      { id: 'l6', title: 'Quiz: SEO Básico', duration: 10, type: 'quiz' as const, dripType: 'days_after_enrollment' as const, dripDays: 14, completed: false },
    ],
  },
  {
    id: 'm3',
    title: 'Marketing de Conteúdo',
    lessons: [
      { id: 'l7', title: 'Criação de Conteúdo', duration: 30, type: 'video' as const, dripType: 'days_after_enrollment' as const, dripDays: 21, completed: false },
      { id: 'l8', title: 'Calendário Editorial', duration: 15, type: 'text' as const, dripType: 'days_after_enrollment' as const, dripDays: 28, completed: false },
    ],
  },
];

const mockUpsellCourses = [
  {
    id: '2',
    title: 'Marketing Digital PRO - Masterclass Completa',
    thumbnail: '/placeholder.svg',
    price: 997,
    originalPrice: 1497,
    rating: 4.9,
    studentsCount: 890,
    duration: 1200,
    category: 'PRO',
  },
];

const mockCrossSellCourses = [
  {
    id: '3',
    title: 'Copywriting Persuasivo',
    thumbnail: '/placeholder.svg',
    price: 297,
    originalPrice: 397,
    rating: 4.8,
    studentsCount: 560,
    duration: 360,
    category: 'Escrita',
  },
  {
    id: '4',
    title: 'Tráfego Pago do Zero',
    thumbnail: '/placeholder.svg',
    price: 397,
    originalPrice: 497,
    rating: 4.7,
    studentsCount: 720,
    duration: 480,
    category: 'Ads',
  },
];

const StudentCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  const handlePlayLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Navigate to player
    navigate(`/student/courses/${courseId}/lesson/${lessonId}`);
  };

  const handleCourseClick = (id: string) => {
    navigate(`/student/courses/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{mockCourse.title}</h1>
          <p className="text-muted-foreground">Instrutor: {mockCourse.instructor}</p>
        </div>
        <Button onClick={() => handlePlayLesson('l1')}>
          <Play className="mr-2 h-4 w-4" />
          Continuar
        </Button>
      </div>

      {/* Course Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-bold">{mockCourse.rating}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <span>{mockCourse.lessonsCount} aulas</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{Math.floor(mockCourse.duration / 60)}h de conteúdo</span>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Award className="h-4 w-4" />
              Certificado incluso
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Seu progresso</span>
              <span className="text-sm font-medium">{mockCourse.progress}%</span>
            </div>
            <Progress value={mockCourse.progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules & Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Conteúdo do Curso</h2>
          {mockModules.map((module) => (
            <CourseModule
              key={module.id}
              title={module.title}
              lessons={module.lessons}
              enrollmentDate={mockCourse.enrollmentDate}
              onPlayLesson={handlePlayLesson}
            />
          ))}
        </div>

        {/* Sidebar - Upsell */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Liberação de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                As aulas são liberadas gradualmente após sua matrícula para garantir melhor absorção do conteúdo.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-yellow-500" />
                  <span>Módulo 2: 7-14 dias após matrícula</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-yellow-500" />
                  <span>Módulo 3: 21-28 dias após matrícula</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upsell - Upgrade */}
          {mockUpsellCourses.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                🚀 FAÇA O UPGRADE
              </h3>
              {mockUpsellCourses.map((course) => (
                <UpsellCompact
                  key={course.id}
                  course={course}
                  onCourseClick={handleCourseClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cross-sell Section */}
      {mockCrossSellCourses.length > 0 && (
        <UpsellSection
          title="Cursos Relacionados"
          subtitle="Complemente seu aprendizado"
          courses={mockCrossSellCourses}
          type="crosssell"
          onCourseClick={handleCourseClick}
        />
      )}
    </div>
  );
};

export default StudentCourseView;
