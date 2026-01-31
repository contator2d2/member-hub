# API Endpoints - Área de Membros

Documentação completa dos endpoints que a API precisa implementar.

**Base URL**: `https://api.seudominio.com/api`

---

## 🔐 Autenticação

### POST `/auth/register`
Registra um novo usuário.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome Completo"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome Completo",
    "role": "student",
    "createdAt": "2025-01-31T..."
  },
  "token": "jwt_token_aqui"
}
```

### POST `/auth/login`
Autentica um usuário.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": { ... },
  "token": "jwt_token_aqui"
}
```

### GET `/auth/me`
Retorna o usuário atual (requer token).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "email": "...",
    "name": "...",
    "role": "student"
  }
}
```

### POST `/auth/logout`
Invalida o token atual.

### POST `/auth/forgot-password`
Envia email de recuperação.

### POST `/auth/reset-password`
Redefine a senha com token.

---

## 👥 Usuários (Admin)

### GET `/users`
Lista usuários com filtros e paginação.

**Query params:** `?search=&role=&page=1&limit=10`

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### GET `/users/:id`
Retorna um usuário específico.

### POST `/users`
Cria um novo usuário (admin).

### PATCH `/users/:id`
Atualiza um usuário.

### DELETE `/users/:id`
Remove um usuário.

### GET `/users/instructors`
Lista apenas instrutores.

### GET `/users/students`
Lista apenas alunos.

---

## 📚 Cursos

### GET `/courses`
Lista cursos com filtros.

**Query params:** `?search=&status=&instructorId=&page=1&limit=10`

### GET `/courses/:id`
Retorna detalhes de um curso.

### GET `/courses/:id/full`
Retorna curso com todos os módulos e aulas.

### POST `/courses` (Admin)
Cria um novo curso.

**Request:**
```json
{
  "title": "Nome do Curso",
  "description": "Descrição...",
  "instructorId": "uuid",
  "price": 299.90,
  "status": "draft"
}
```

### PATCH `/courses/:id` (Admin)
Atualiza um curso.

### DELETE `/courses/:id` (Admin)
Remove um curso.

### POST `/courses/:id/publish` (Admin)
Publica um curso.

### POST `/courses/:id/archive` (Admin)
Arquiva um curso.

### POST `/courses/:id/thumbnail` (Admin)
Upload da thumbnail.

**Content-Type:** `multipart/form-data`

---

## 📦 Módulos

### GET `/courses/:courseId/modules`
Lista módulos de um curso.

### POST `/courses/:courseId/modules` (Admin)
Cria um módulo.

### PATCH `/modules/:id` (Admin)
Atualiza um módulo.

### DELETE `/modules/:id` (Admin)
Remove um módulo.

### POST `/courses/:courseId/modules/reorder` (Admin)
Reordena módulos.

---

## 🎬 Aulas

### GET `/modules/:moduleId/lessons`
Lista aulas de um módulo.

### GET `/lessons/:id`
Retorna detalhes de uma aula.

### POST `/modules/:moduleId/lessons` (Admin)
Cria uma aula.

**Request:**
```json
{
  "title": "Nome da Aula",
  "type": "video",
  "duration": 15,
  "content": {
    "provider": "youtube",
    "url": "https://youtube.com/watch?v=...",
    "videoId": "abc123"
  },
  "dripType": "days_after_enrollment",
  "dripDays": 7
}
```

### PATCH `/lessons/:id` (Admin)
Atualiza uma aula.

### DELETE `/lessons/:id` (Admin)
Remove uma aula.

### POST `/lessons/:id/video` (Admin)
Upload de vídeo.

---

## 📝 Matrículas

### GET `/enrollments` (Admin)
Lista todas as matrículas.

### GET `/enrollments/me`
Lista matrículas do usuário atual.

### POST `/enrollments` (Admin)
Cria matrícula manual.

### POST `/courses/:id/enroll`
Solicita matrícula (aluno).

### GET `/courses/:id/enrollment`
Verifica se está matriculado.

### POST `/enrollments/:id/approve` (Admin)
Aprova matrícula pendente.

### POST `/enrollments/:id/reject` (Admin)
Rejeita matrícula.

### PATCH `/enrollments/:id/payment` (Admin)
Atualiza status de pagamento.

---

## 📈 Progresso

### GET `/courses/:id/progress`
Retorna progresso do usuário no curso.

**Response:**
```json
{
  "data": {
    "courseId": "uuid",
    "totalLessons": 20,
    "completedLessons": 8,
    "progressPercent": 40,
    "lastAccessedAt": "2025-01-31T...",
    "lessonsProgress": [...]
  }
}
```

### POST `/lessons/:id/progress`
Atualiza tempo assistido.

**Request:**
```json
{
  "watchedSeconds": 180
}
```

### POST `/lessons/:id/complete`
Marca aula como concluída.

### POST `/lessons/:id/quiz/submit`
Envia respostas do quiz.

---

## 🏆 Gamificação

### GET `/gamification/stats`
Retorna estatísticas do usuário.

**Response:**
```json
{
  "data": {
    "totalCoursesEnrolled": 5,
    "completedCourses": 2,
    "totalWatchTime": 1200,
    "currentStreak": 7,
    "longestStreak": 14,
    "totalBadges": 5,
    "totalCertificates": 2,
    "points": 2500
  }
}
```

### GET `/gamification/badges`
Lista todas as badges disponíveis.

### GET `/gamification/badges/me`
Lista badges do usuário.

### GET `/gamification/certificates`
Lista certificados do usuário.

### POST `/courses/:id/certificate/claim`
Reivindica certificado após completar curso.

### GET `/gamification/leaderboard`
Retorna ranking de pontos.

### POST `/gamification/daily-login`
Registra login diário (para streak).

---

## 📊 Admin Dashboard

### GET `/admin/dashboard/stats`
Estatísticas gerais.

**Response:**
```json
{
  "data": {
    "totalUsers": 1250,
    "totalStudents": 1180,
    "totalInstructors": 70,
    "totalCourses": 45,
    "publishedCourses": 38,
    "totalEnrollments": 3420,
    "activeEnrollments": 2890,
    "totalRevenue": 125680,
    "monthlyRevenue": 18450
  }
}
```

### GET `/admin/dashboard/activity`
Atividades recentes.

### GET `/admin/analytics/revenue`
Dados de receita para gráficos.

### GET `/admin/analytics/enrollments`
Dados de matrículas para gráficos.

---

## 🔒 Autenticação JWT

Todas as rotas protegidas requerem:

```
Authorization: Bearer <jwt_token>
```

### Payload do JWT:
```json
{
  "userId": "uuid",
  "email": "...",
  "role": "student|instructor|admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 📤 Respostas Padrão

### Sucesso (200/201):
```json
{
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro (4xx/5xx):
```json
{
  "message": "Descrição do erro",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## 🎯 Lógica de Drip Content

Para verificar se uma aula está liberada:

```javascript
function isLessonUnlocked(lesson, enrollmentDate) {
  if (lesson.dripType === 'immediate') return true;
  
  const now = new Date();
  const enrolled = new Date(enrollmentDate);
  
  if (lesson.dripType === 'days_after_enrollment') {
    const unlockDate = addDays(enrolled, lesson.dripDays);
    return now >= unlockDate;
  }
  
  if (lesson.dripType === 'fixed_date') {
    return now >= new Date(lesson.dripDate);
  }
  
  return false;
}
```

---

## 💡 Dicas de Implementação

1. **Use bcrypt** para hash de senhas
2. **Use jsonwebtoken** para JWT
3. **Use multer** para upload de arquivos
4. **Use cors** com origens específicas
5. **Use helmet** para segurança
6. **Valide inputs** com Zod ou Joi
