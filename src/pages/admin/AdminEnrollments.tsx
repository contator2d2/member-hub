import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  MoreHorizontal,
  Check,
  X,
  Eye,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const mockEnrollments = [
  {
    id: '1',
    userName: 'Maria Santos',
    userEmail: 'maria@email.com',
    courseName: 'Marketing Digital Avançado',
    status: 'pending',
    paymentStatus: 'pending',
    price: 299,
    enrolledAt: '2024-04-15',
  },
  {
    id: '2',
    userName: 'Pedro Lima',
    userEmail: 'pedro@email.com',
    courseName: 'Liderança e Gestão',
    status: 'active',
    paymentStatus: 'paid',
    price: 399,
    enrolledAt: '2024-04-10',
  },
  {
    id: '3',
    userName: 'Ana Costa',
    userEmail: 'ana@email.com',
    courseName: 'Finanças Pessoais',
    status: 'active',
    paymentStatus: 'paid',
    price: 199,
    enrolledAt: '2024-04-08',
  },
  {
    id: '4',
    userName: 'Carlos Oliveira',
    userEmail: 'carlos@email.com',
    courseName: 'Desenvolvimento Web',
    status: 'pending',
    paymentStatus: 'pending',
    price: 499,
    enrolledAt: '2024-04-14',
  },
  {
    id: '5',
    userName: 'João Silva',
    userEmail: 'joao@email.com',
    courseName: 'Comunicação Efetiva',
    status: 'completed',
    paymentStatus: 'paid',
    price: 149,
    enrolledAt: '2024-02-01',
  },
];

const AdminEnrollments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<typeof mockEnrollments[0] | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'payment'>('approve');

  const filteredEnrollments = mockEnrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || enrollment.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pendente</Badge>;
      case 'refunded':
        return <Badge variant="outline">Reembolsado</Badge>;
      default:
        return null;
    }
  };

  const handleAction = () => {
    if (actionType === 'approve') {
      toast.success('Matrícula aprovada!');
    } else if (actionType === 'reject') {
      toast.success('Matrícula rejeitada!');
    } else {
      toast.success('Pagamento confirmado!');
    }
    setApproveDialogOpen(false);
    setSelectedEnrollment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Matrículas</h2>
        <p className="text-muted-foreground">Gerencie as matrículas dos alunos</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {mockEnrollments.filter((e) => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {mockEnrollments.filter((e) => e.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockEnrollments.filter((e) => e.paymentStatus === 'paid').reduce((acc, e) => acc + e.price, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar matrículas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="refunded">Reembolsados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma matrícula encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={undefined} />
                          <AvatarFallback>{enrollment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{enrollment.userName}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.userEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{enrollment.courseName}</TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell>{getPaymentBadge(enrollment.paymentStatus)}</TableCell>
                    <TableCell className="text-right">R$ {enrollment.price.toLocaleString()}</TableCell>
                    <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Detalhes
                          </DropdownMenuItem>
                          {enrollment.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setActionType('approve');
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                Aprovar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEnrollment(enrollment);
                                  setActionType('reject');
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <X className="mr-2 h-4 w-4 text-destructive" />
                                Rejeitar
                              </DropdownMenuItem>
                            </>
                          )}
                          {enrollment.paymentStatus === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEnrollment(enrollment);
                                setActionType('payment');
                                setApproveDialogOpen(true);
                              }}
                            >
                              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                              Confirmar Pagamento
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Aprovar Matrícula'}
              {actionType === 'reject' && 'Rejeitar Matrícula'}
              {actionType === 'payment' && 'Confirmar Pagamento'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' &&
                `Confirma a aprovação da matrícula de ${selectedEnrollment?.userName} no curso ${selectedEnrollment?.courseName}?`}
              {actionType === 'reject' &&
                `Confirma a rejeição da matrícula de ${selectedEnrollment?.userName}?`}
              {actionType === 'payment' &&
                `Confirma o recebimento do pagamento de R$ ${selectedEnrollment?.price} de ${selectedEnrollment?.userName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
            >
              {actionType === 'approve' && 'Aprovar'}
              {actionType === 'reject' && 'Rejeitar'}
              {actionType === 'payment' && 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEnrollments;
