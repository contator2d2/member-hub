import { Lock, Clock, Play, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, addDays, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DripType = 'immediate' | 'days_after_enrollment' | 'fixed_date';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  dripType: DripType;
  dripDays?: number;
  dripDate?: string;
  completed?: boolean;
}

interface LessonItemProps {
  lesson: Lesson;
  enrollmentDate: string;
  onPlay?: (lessonId: string) => void;
}

export function LessonItem({ lesson, enrollmentDate, onPlay }: LessonItemProps) {
  const isUnlocked = checkLessonUnlocked(lesson, enrollmentDate);
  const unlockDate = getUnlockDate(lesson, enrollmentDate);
  const daysUntilUnlock = unlockDate ? differenceInDays(unlockDate, new Date()) : 0;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
        isUnlocked
          ? 'border-border hover:bg-accent/50 cursor-pointer'
          : 'border-border/50 bg-muted/30'
      }`}
      onClick={() => isUnlocked && onPlay?.(lesson.id)}
    >
      {/* Status Icon */}
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center ${
          lesson.completed
            ? 'bg-green-500/10 text-green-500'
            : isUnlocked
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {lesson.completed ? (
          <CheckCircle className="h-5 w-5" />
        ) : isUnlocked ? (
          <Play className="h-5 w-5" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium truncate ${
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {lesson.title}
        </h4>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lesson.duration} min
          </span>
          {!isUnlocked && unlockDate && (
            <span className="flex items-center gap-1 text-yellow-500">
              <Calendar className="h-3 w-3" />
              {daysUntilUnlock > 0
                ? `Libera em ${daysUntilUnlock} dia${daysUntilUnlock > 1 ? 's' : ''}`
                : format(unlockDate, "dd 'de' MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      {isUnlocked ? (
        <Button size="sm" variant={lesson.completed ? 'outline' : 'default'}>
          {lesson.completed ? 'Rever' : 'Assistir'}
        </Button>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          Bloqueado
        </Badge>
      )}
    </div>
  );
}

interface CourseModuleProps {
  title: string;
  lessons: Lesson[];
  enrollmentDate: string;
  onPlayLesson?: (lessonId: string) => void;
}

export function CourseModule({ title, lessons, enrollmentDate, onPlayLesson }: CourseModuleProps) {
  const completedLessons = lessons.filter((l) => l.completed).length;
  const unlockedLessons = lessons.filter((l) => checkLessonUnlocked(l, enrollmentDate)).length;
  const progress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedLessons} de {lessons.length} aulas liberadas • {completedLessons} concluídas
            </p>
          </div>
          <div className="w-24">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              enrollmentDate={enrollmentDate}
              onPlay={onPlayLesson}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function checkLessonUnlocked(lesson: Lesson, enrollmentDate: string): boolean {
  if (lesson.dripType === 'immediate') {
    return true;
  }

  const now = new Date();
  const enrolled = new Date(enrollmentDate);

  if (lesson.dripType === 'days_after_enrollment' && lesson.dripDays !== undefined) {
    const unlockDate = addDays(enrolled, lesson.dripDays);
    return isBefore(unlockDate, now) || unlockDate.toDateString() === now.toDateString();
  }

  if (lesson.dripType === 'fixed_date' && lesson.dripDate) {
    const unlockDate = new Date(lesson.dripDate);
    return isBefore(unlockDate, now) || unlockDate.toDateString() === now.toDateString();
  }

  return false;
}

function getUnlockDate(lesson: Lesson, enrollmentDate: string): Date | null {
  if (lesson.dripType === 'immediate') {
    return null;
  }

  const enrolled = new Date(enrollmentDate);

  if (lesson.dripType === 'days_after_enrollment' && lesson.dripDays !== undefined) {
    return addDays(enrolled, lesson.dripDays);
  }

  if (lesson.dripType === 'fixed_date' && lesson.dripDate) {
    return new Date(lesson.dripDate);
  }

  return null;
}

export { checkLessonUnlocked, getUnlockDate };
