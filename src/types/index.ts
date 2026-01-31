// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// ============================================
// COURSE TYPES
// ============================================

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  instructor?: User;
  status: CourseStatus;
  price: number;
  originalPrice?: number; // For showing discounts
  duration: number; // in minutes
  rating: number;
  studentsCount: number;
  // Access control
  isLocked?: boolean; // User doesn't have access
  // Upsell/Cross-sell
  upsellCourseIds?: string[]; // Higher-tier courses to promote
  crossSellCourseIds?: string[]; // Related courses to recommend
  modulesCount: number;
  lessonsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  price: number;
  status?: CourseStatus;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  id: string;
}

// ============================================
// MODULE TYPES
// ============================================

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessonsCount: number;
  duration: number; // in minutes
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleData {
  courseId: string;
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateModuleData extends Partial<CreateModuleData> {
  id: string;
}

// ============================================
// LESSON TYPES
// ============================================

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment';
export type VideoProvider = 'youtube' | 'vimeo' | 'upload';
export type DripType = 'immediate' | 'days_after_enrollment' | 'fixed_date';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: LessonType;
  content: LessonContent;
  order: number;
  duration: number; // in minutes
  // Drip content settings
  dripType: DripType;
  dripDays?: number; // Days after enrollment to unlock
  dripDate?: string; // Fixed date to unlock (ISO string)
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoContent {
  provider: VideoProvider;
  url: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export interface TextContent {
  html: string;
  attachments?: Attachment[];
}

export interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface AssignmentContent {
  instructions: string;
  attachments?: Attachment[];
  dueDate?: string;
}

export type LessonContent = VideoContent | TextContent | QuizContent | AssignmentContent;

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateLessonData {
  moduleId: string;
  title: string;
  description?: string;
  type: LessonType;
  content: LessonContent;
  order?: number;
  duration: number;
  isFree?: boolean;
}

export interface UpdateLessonData extends Partial<CreateLessonData> {
  id: string;
}

// ============================================
// ENROLLMENT & PROGRESS TYPES
// ============================================

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Enrollment {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  progress: number; // 0-100
  enrolledAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  lessonTitle?: string;
  userId: string;
  completed: boolean;
  watchedSeconds: number;
  completedAt?: string;
  quizScore?: number;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastAccessedAt?: string;
  lessonsProgress: LessonProgress[];
}

// ============================================
// GAMIFICATION TYPES
// ============================================

export type BadgeType = 'completion' | 'streak' | 'achievement' | 'milestone';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  requirement: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  earnedAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  user?: User;
  certificateNumber: string;
  issuedAt: string;
  downloadUrl?: string;
}

export interface UserStats {
  totalCoursesEnrolled: number;
  completedCourses: number;
  totalWatchTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  totalBadges: number;
  totalCertificates: number;
  rank?: number;
  points: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'payment' | 'registration';
  userId: string;
  userName: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}
