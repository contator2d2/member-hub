import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Upload,
  Save,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockCourse = {
  id: '1',
  title: 'Marketing Digital Avançado',
  modules: [
    {
      id: 'm1',
      title: 'Introdução ao Marketing Digital',
      order: 1,
      lessons: [
        { id: 'l1', title: 'Boas-vindas ao curso', type: 'video' as LessonType, duration: 5, order: 1 },
        { id: 'l2', title: 'O que é Marketing Digital?', type: 'video' as LessonType, duration: 15, order: 2 },
        { id: 'l3', title: 'História e Evolução', type: 'text' as LessonType, duration: 10, order: 3 },
      ],
    },
    {
      id: 'm2',
      title: 'Estratégias de SEO',
      order: 2,
      lessons: [
        { id: 'l4', title: 'Fundamentos de SEO', type: 'video' as LessonType, duration: 20, order: 1 },
        { id: 'l5', title: 'Palavras-chave', type: 'video' as LessonType, duration: 25, order: 2 },
        { id: 'l6', title: 'Quiz: SEO Básico', type: 'quiz' as LessonType, duration: 10, order: 3 },
      ],
    },
    {
      id: 'm3',
      title: 'Marketing de Conteúdo',
      order: 3,
      lessons: [
        { id: 'l7', title: 'Criação de Conteúdo', type: 'video' as LessonType, duration: 30, order: 1 },
        { id: 'l8', title: 'Calendário Editorial', type: 'text' as LessonType, duration: 15, order: 2 },
      ],
    },
  ],
};

type LessonType = 'video' | 'text' | 'quiz' | 'assignment';

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: number;
  order: number;
}

const AdminModulesManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(mockCourse.modules);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson | null }>({
    moduleId: '',
    lesson: null,
  });

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');

  const [newLessonData, setNewLessonData] = useState({
    title: '',
    type: 'video' as LessonType,
    duration: 0,
    videoUrl: '',
    content: '',
  });

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;

    const newModule: Module = {
      id: `m${Date.now()}`,
      title: newModuleTitle,
      order: modules.length + 1,
      lessons: [],
    };

    setModules([...modules, newModule]);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setModuleDialogOpen(false);
    toast.success('Módulo adicionado!');
  };

  const handleEditModule = () => {
    if (!editingModule || !newModuleTitle.trim()) return;

    setModules(
      modules.map((m) =>
        m.id === editingModule.id ? { ...m, title: newModuleTitle } : m
      )
    );
    setEditingModule(null);
    setNewModuleTitle('');
    setModuleDialogOpen(false);
    toast.success('Módulo atualizado!');
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
    toast.success('Módulo excluído!');
  };

  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    const index = modules.findIndex((m) => m.id === moduleId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === modules.length - 1)
    ) {
      return;
    }

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    // Update order
    newModules.forEach((m, i) => {
      m.order = i + 1;
    });

    setModules(newModules);
  };

  const handleAddLesson = () => {
    if (!newLessonData.title.trim() || !editingLesson.moduleId) return;

    const targetModule = modules.find((m) => m.id === editingLesson.moduleId);
    if (!targetModule) return;

    const newLesson: Lesson = {
      id: `l${Date.now()}`,
      title: newLessonData.title,
      type: newLessonData.type,
      duration: newLessonData.duration,
      order: targetModule.lessons.length + 1,
    };

    setModules(
      modules.map((m) =>
        m.id === editingLesson.moduleId
          ? { ...m, lessons: [...m.lessons, newLesson] }
          : m
      )
    );

    setNewLessonData({ title: '', type: 'video', duration: 0, videoUrl: '', content: '' });
    setLessonDialogOpen(false);
    toast.success('Aula adicionada!');
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    );
    toast.success('Aula excluída!');
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'text':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Upload className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Gerenciar Módulos</h2>
            <p className="text-muted-foreground">{mockCourse.title}</p>
          </div>
        </div>
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingModule(null);
                setNewModuleTitle('');
                setNewModuleDescription('');
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</DialogTitle>
              <DialogDescription>
                {editingModule ? 'Atualize as informações do módulo' : 'Adicione um novo módulo ao curso'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Título do Módulo</Label>
                <Input
                  id="module-title"
                  placeholder="Ex: Introdução ao curso"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Descrição (opcional)</Label>
                <Textarea
                  id="module-description"
                  placeholder="Descreva o conteúdo deste módulo..."
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingModule ? handleEditModule : handleAddModule}>
                <Save className="mr-2 h-4 w-4" />
                {editingModule ? 'Salvar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos do Curso</CardTitle>
          <CardDescription>
            Arraste para reordenar os módulos e aulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum módulo criado ainda.</p>
              <p className="text-sm">Clique em "Novo Módulo" para começar.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="border rounded-lg px-4"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <AccordionTrigger className="flex-1 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                          {module.order}
                        </span>
                        <div className="text-left">
                          <p className="font-medium">{module.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {module.lessons.length} aulas
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveModule(module.id, 'up');
                        }}
                        disabled={moduleIndex === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveModule(module.id, 'down');
                        }}
                        disabled={moduleIndex === modules.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModule(module);
                          setNewModuleTitle(module.title);
                          setModuleDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="space-y-2 pt-4">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          {getLessonIcon(lesson.type)}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration} min
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteLesson(module.id, lesson.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          setEditingLesson({ moduleId: module.id, lesson: null });
                          setNewLessonData({ title: '', type: 'video', duration: 0, videoUrl: '', content: '' });
                          setLessonDialogOpen(true);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Aula
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Aula</DialogTitle>
            <DialogDescription>Configure o conteúdo da aula</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Título da Aula</Label>
                <Input
                  id="lesson-title"
                  placeholder="Ex: Introdução ao tema"
                  value={newLessonData.title}
                  onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lesson-type">Tipo de Conteúdo</Label>
                <Select
                  value={newLessonData.type}
                  onValueChange={(value) =>
                    setNewLessonData({ ...newLessonData, type: value as LessonType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="text">Texto/PDF</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Tarefa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duração (minutos)</Label>
              <Input
                id="lesson-duration"
                type="number"
                min="1"
                value={newLessonData.duration}
                onChange={(e) =>
                  setNewLessonData({ ...newLessonData, duration: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            {newLessonData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">URL do Vídeo (YouTube/Vimeo) ou Upload</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newLessonData.videoUrl}
                  onChange={(e) => setNewLessonData({ ...newLessonData, videoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Ou faça upload de um arquivo de vídeo
                </p>
                <Input type="file" accept="video/*" />
              </div>
            )}

            {newLessonData.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="lesson-content">Conteúdo</Label>
                <Textarea
                  id="lesson-content"
                  placeholder="Digite o conteúdo da aula..."
                  rows={6}
                  value={newLessonData.content}
                  onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddLesson}>
              <Save className="mr-2 h-4 w-4" />
              Adicionar Aula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModulesManager;
