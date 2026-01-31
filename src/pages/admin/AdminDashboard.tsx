import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  UserPlus,
  GraduationCap,
  Clock,
} from 'lucide-react';

// Mock data - will be replaced with API calls
const mockStats = {
  totalUsers: 1247,
  totalStudents: 1180,
  totalInstructors: 67,
  totalCourses: 45,
  publishedCourses: 38,
  totalEnrollments: 3420,
  activeEnrollments: 2890,
  totalRevenue: 125680,
  monthlyRevenue: 18450,
};

const mockRecentActivity = [
  { id: '1', type: 'enrollment', userName: 'Maria Silva', courseName: 'Marketing Digital', createdAt: '2 min atrás' },
  { id: '2', type: 'completion', userName: 'João Santos', courseName: 'Liderança', createdAt: '15 min atrás' },
  { id: '3', type: 'registration', userName: 'Ana Costa', createdAt: '1 hora atrás' },
  { id: '4', type: 'payment', userName: 'Pedro Lima', courseName: 'Finanças', createdAt: '2 horas atrás' },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo da sua plataforma
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.totalStudents} alunos, {mockStats.totalInstructors} instrutores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.publishedCourses} publicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Matrículas Ativas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              de {mockStats.totalEnrollments.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockStats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    {activity.type === 'enrollment' && <BookOpen className="h-4 w-4 text-primary" />}
                    {activity.type === 'completion' && <GraduationCap className="h-4 w-4 text-green-500" />}
                    {activity.type === 'registration' && <UserPlus className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type === 'enrollment' && `Matriculou-se em ${activity.courseName}`}
                      {activity.type === 'completion' && `Completou ${activity.courseName}`}
                      {activity.type === 'registration' && 'Criou uma conta'}
                      {activity.type === 'payment' && `Pagou por ${activity.courseName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Tarefas frequentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/courses/new"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Novo Curso</span>
              </a>
              <a
                href="/admin/users/new"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <UserPlus className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Novo Usuário</span>
              </a>
              <a
                href="/admin/enrollments"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Matrículas</span>
              </a>
              <a
                href="/admin/reports"
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">Relatórios</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
