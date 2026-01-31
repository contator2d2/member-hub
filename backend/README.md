# Área de Membros - API Backend

API REST completa para o sistema de área de membros.

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Rodar migration do banco

```bash
npm run db:migrate
```

### 4. Iniciar servidor

```bash
# Produção
npm start

# Desenvolvimento
npm run dev
```

## 🔐 Credenciais Padrão

Após a migration, um usuário admin é criado:

- **Email:** admin@exemplo.com
- **Senha:** admin123

⚠️ **Altere a senha após o primeiro login!**

## 📁 Estrutura

```
backend/
├── src/
│   ├── index.js          # Entry point
│   ├── config/
│   │   └── database.js   # PostgreSQL connection
│   ├── middleware/
│   │   ├── auth.js       # JWT authentication
│   │   └── upload.js     # File upload (multer)
│   ├── routes/
│   │   ├── auth.js       # Autenticação
│   │   ├── users.js      # CRUD usuários
│   │   ├── courses.js    # CRUD cursos
│   │   ├── modules.js    # CRUD módulos
│   │   ├── lessons.js    # CRUD aulas
│   │   ├── enrollments.js# Matrículas
│   │   ├── progress.js   # Progresso do aluno
│   │   ├── gamification.js # Badges, certificados
│   │   └── admin.js      # Dashboard admin
│   └── database/
│       └── migrate.js    # Migration script
├── uploads/              # Arquivos enviados
├── Dockerfile
├── package.json
└── .env.example
```

## 🐳 Deploy com Docker

```bash
docker build -t area-membros-api .
docker run -p 3000:3000 --env-file .env area-membros-api
```

## 📚 Endpoints

Veja a documentação completa em `docs/API_ENDPOINTS.md`.

### Principais rotas:

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/register | Registrar usuário |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuário atual |
| GET | /api/courses | Listar cursos |
| GET | /api/courses/:id/full | Curso completo |
| POST | /api/lessons/:id/complete | Completar aula |
| GET | /api/gamification/stats | Stats do usuário |

## 🔒 Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <jwt_token>
```

## 🎮 Gamificação

O sistema inclui:
- **Pontos**: Ganhos por completar aulas e login diário
- **Streaks**: Dias consecutivos de acesso
- **Badges**: Conquistas desbloqueáveis
- **Certificados**: Emitidos ao completar cursos
- **Leaderboard**: Ranking por pontos

## 📅 Drip Content

Tipos de liberação de aulas:
- `immediate`: Disponível imediatamente
- `days_after_enrollment`: X dias após matrícula
- `fixed_date`: Data específica

## ⚙️ Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | Connection string PostgreSQL | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secret para tokens JWT | random-256-bit-string |
| JWT_EXPIRES_IN | Expiração do token | 7d |
| CORS_ORIGIN | URL do frontend | https://app.lovable.app |
| PORT | Porta do servidor | 3000 |
