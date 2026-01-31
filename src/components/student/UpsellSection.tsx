import { ArrowRight, Star, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  duration: number;
  category?: string;
}

interface UpsellSectionProps {
  title: string;
  subtitle?: string;
  courses: Course[];
  type: 'upsell' | 'crosssell';
  onCourseClick?: (courseId: string) => void;
}

export function UpsellSection({
  title,
  subtitle,
  courses,
  type,
  onCourseClick,
}: UpsellSectionProps) {
  if (courses.length === 0) return null;

  return (
    <Card className={type === 'upsell' ? 'border-primary/50 bg-primary/5' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {type === 'upsell' && (
                <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
              )}
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onCourseClick?.(course.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-muted">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
                {course.originalPrice && course.originalPrice > course.price && (
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {course.category && (
                  <Badge variant="secondary" className="mb-2">
                    {course.category}
                  </Badge>
                )}
                <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h4>

                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    {course.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.studentsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(course.duration / 60)}h
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <span className="text-lg font-bold text-primary">
                      R$ {course.price.toLocaleString()}
                    </span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="ml-2 text-sm text-muted-foreground line-through">
                        R$ {course.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    Ver mais
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar or smaller spaces
interface UpsellCompactProps {
  course: Course;
  onCourseClick?: (courseId: string) => void;
}

export function UpsellCompact({ course, onCourseClick }: UpsellCompactProps) {
  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
      onClick={() => onCourseClick?.(course.id)}
    >
      <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
            Curso
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{course.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-primary">
            R$ {course.price.toLocaleString()}
          </span>
          {discount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {discount}% OFF
            </Badge>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

// Bundle offer component
interface BundleOfferProps {
  title: string;
  courses: Course[];
  bundlePrice: number;
  originalTotal: number;
  onBuyBundle?: () => void;
}

export function BundleOffer({
  title,
  courses,
  bundlePrice,
  originalTotal,
  onBuyBundle,
}: BundleOfferProps) {
  const savings = originalTotal - bundlePrice;
  const discount = Math.round((savings / originalTotal) * 100);

  return (
    <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            {title}
          </CardTitle>
          <Badge className="bg-green-500 text-white text-lg px-3 py-1">
            Economize {discount}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {courses.map((course) => (
            <div key={course.id} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{course.title}</p>
                <p className="text-sm text-muted-foreground line-through">
                  R$ {course.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Preço do combo</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  R$ {bundlePrice.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  R$ {originalTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-green-500 font-medium">
                Você economiza R$ {savings.toLocaleString()}!
              </p>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={onBuyBundle}>
            Comprar Combo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpsellSection;
