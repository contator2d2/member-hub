# Guia de Configuração - Easypanel + API Backend

Este documento explica como configurar seu backend no Easypanel para funcionar com o frontend da área de membros.

## 📋 Pré-requisitos

- VPS com Easypanel instalado
- Domínio configurado (opcional, mas recomendado)

---

## 🚀 Passo 1: Criar o Projeto no Easypanel

1. Acesse seu Easypanel (geralmente `http://seu-ip:3000`)
2. Clique em **"Create Project"**
3. Nomeie o projeto (ex: `area-membros`)

---

## 🐘 Passo 2: Configurar PostgreSQL

### Criar o serviço de banco de dados:

1. No projeto, clique em **"+ Add Service"**
2. Selecione **"Postgres"**
3. Configure:
   - **Name**: `postgres`
   - **Image**: `postgres:15` (ou versão mais recente)
   - **Password**: Gere uma senha forte

### Configurar variáveis de ambiente do Postgres:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_segura
POSTGRES_DB=area_membros
```

### Anote a connection string:

```
postgresql://postgres:sua_senha_segura@postgres:5432/area_membros
```

---

## 🖥️ Passo 3: Criar a API (Node.js/Express)

### Opção A: Usando imagem Docker própria

1. Clique em **"+ Add Service"**
2. Selecione **"App"**
3. Configure:
   - **Name**: `api`
   - **Source**: GitHub (conecte seu repositório da API)
   - **Build**: Dockerfile ou Nixpacks
   
### Opção B: Usando template Node.js

1. Clique em **"+ Add Service"**
2. Selecione **"App"** → **"Node.js"**
3. Conecte seu repositório GitHub

### Variáveis de ambiente da API:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:sua_senha_segura@postgres:5432/area_membros
JWT_SECRET=gere_um_secret_de_256_bits_aqui
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-frontend.lovable.app
```

---

## 🌐 Passo 4: Configurar Domínio e HTTPS

1. No serviço `api`, vá em **"Domains"**
2. Adicione seu domínio: `api.seudominio.com`
3. Ative **"HTTPS"** (Let's Encrypt automático)
4. Defina a porta: `3000`

---

## 🔗 Passo 5: Conectar o Frontend

No seu projeto Lovable, crie um arquivo `.env` local ou configure a variável:

```env
VITE_API_URL=https://api.seudominio.com/api
```

Se ainda não tem domínio, use o IP temporariamente:

```env
VITE_API_URL=http://seu-ip:3000/api
```

---

## 📊 Estrutura de Tabelas (SQL)

Execute este SQL no seu PostgreSQL para criar as tabelas:

```sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum de roles
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment');
CREATE TYPE drip_type AS ENUM ('immediate', 'days_after_enrollment', 'fixed_date');
CREATE TYPE video_provider AS ENUM ('youtube', 'vimeo', 'upload');

-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role user_role DEFAULT 'student',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cursos
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status course_status DEFAULT 'draft',
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    duration INTEGER DEFAULT 0, -- em minutos
    rating DECIMAL(2,1) DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Aulas
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type lesson_type DEFAULT 'video',
    content JSONB, -- Video URL, texto, quiz questions, etc
    "order" INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- em minutos
    is_free BOOLEAN DEFAULT false,
    -- Drip content
    drip_type drip_type DEFAULT 'immediate',
    drip_days INTEGER, -- Dias após matrícula
    drip_date TIMESTAMP, -- Data fixa
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matrículas
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    progress DECIMAL(5,2) DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Progresso das aulas
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    watched_seconds INTEGER DEFAULT 0,
    quiz_score DECIMAL(5,2),
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Gamificação - Badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    type VARCHAR(50), -- completion, streak, achievement, milestone
    requirement INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Badges do usuário
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Certificados
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE,
    issued_at TIMESTAMP DEFAULT NOW(),
    download_url TEXT,
    UNIQUE(user_id, course_id)
);

-- Stats do usuário (gamificação)
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_watch_time INTEGER DEFAULT 0, -- em minutos
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    last_activity_date DATE
);

-- Upsell/Cross-sell relacionamentos
CREATE TABLE course_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    related_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    relation_type VARCHAR(20), -- 'upsell' ou 'crosssell'
    "order" INTEGER DEFAULT 0,
    UNIQUE(course_id, related_course_id, relation_type)
);

-- Índices
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);

-- Criar usuário admin inicial
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@exemplo.com', '$2b$10$hash_aqui', 'Administrador', 'admin');
```

---

## 🔌 Endpoints da API Necessários

Veja o arquivo `API_ENDPOINTS.md` para a lista completa de endpoints que você precisa implementar.

---

## ✅ Checklist de Deploy

- [ ] PostgreSQL rodando no Easypanel
- [ ] API Node.js rodando e conectada ao banco
- [ ] Domínio configurado com HTTPS
- [ ] Variável `VITE_API_URL` configurada no frontend
- [ ] Usuário admin criado no banco
- [ ] Testado login/registro

---

## 🐛 Troubleshooting

### API não conecta ao banco
- Verifique se o nome do serviço Postgres está correto na connection string
- No Easypanel, serviços se comunicam pelo nome (ex: `postgres:5432`)

### CORS bloqueando requisições
- Adicione a URL do frontend em `CORS_ORIGIN`
- Use `*` temporariamente para debug

### Erro 502 Bad Gateway
- Verifique se a porta está correta (geralmente 3000)
- Veja os logs do container no Easypanel

---

## 📞 Suporte

Se precisar de ajuda adicional, me pergunte sobre:
- Implementação de endpoints específicos
- Configuração de autenticação JWT
- Upload de vídeos
- Integração de pagamentos
