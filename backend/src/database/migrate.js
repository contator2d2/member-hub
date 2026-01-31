require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const migrationSQL = `
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum de roles (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE drip_type AS ENUM ('immediate', 'days_after_enrollment', 'fixed_date');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE video_provider AS ENUM ('youtube', 'vimeo', 'upload');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status course_status DEFAULT 'draft',
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    duration INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Aulas
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type lesson_type DEFAULT 'video',
    content JSONB,
    "order" INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    drip_type drip_type DEFAULT 'immediate',
    drip_days INTEGER,
    drip_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matrículas
CREATE TABLE IF NOT EXISTS enrollments (
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
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    watched_seconds INTEGER DEFAULT 0,
    quiz_score DECIMAL(5,2),
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    type VARCHAR(50),
    requirement INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Badges do usuário
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Certificados
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE,
    issued_at TIMESTAMP DEFAULT NOW(),
    download_url TEXT,
    UNIQUE(user_id, course_id)
);

-- Stats do usuário (gamificação)
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_watch_time INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    last_activity_date DATE
);

-- Upsell/Cross-sell relacionamentos
CREATE TABLE IF NOT EXISTS course_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    related_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    relation_type VARCHAR(20),
    "order" INTEGER DEFAULT 0,
    UNIQUE(course_id, related_course_id, relation_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- Inserir badges padrão
INSERT INTO badges (name, description, icon, type, requirement) VALUES
    ('Primeiro Passo', 'Complete sua primeira aula', 'play', 'completion', 1),
    ('Dedicado', 'Complete 10 aulas', 'target', 'completion', 10),
    ('Maratonista', 'Complete 50 aulas', 'zap', 'completion', 50),
    ('Semana de Fogo', 'Mantenha streak de 7 dias', 'flame', 'streak', 7),
    ('Mês Consistente', 'Mantenha streak de 30 dias', 'calendar', 'streak', 30),
    ('Centurião', 'Mantenha streak de 100 dias', 'crown', 'streak', 100),
    ('Formado', 'Complete seu primeiro curso', 'graduation-cap', 'achievement', 1),
    ('Colecionador', 'Complete 5 cursos', 'library', 'achievement', 5)
ON CONFLICT DO NOTHING;

-- Criar usuário admin padrão (senha: admin123)
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@exemplo.com', 
    '$2a$10$rQnM1eHGxBfJHh8eGGq9/.5.8Mjv5BxGQI6qGKj7YJQJ3xDvWxB6G',
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Criar stats para admin
INSERT INTO user_stats (user_id)
SELECT id FROM users WHERE email = 'admin@exemplo.com'
ON CONFLICT DO NOTHING;

SELECT 'Migration completed successfully!' as result;
`;

async function migrate() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration completed successfully!');
    console.log('\n📝 Default admin credentials:');
    console.log('   Email: admin@exemplo.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  Please change the admin password after first login!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
