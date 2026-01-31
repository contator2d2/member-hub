import { Play, Plus, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ContentCardProps {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  rating: number;
  category: string;
  progress?: number;
}

const ContentCard = ({
  title,
  thumbnail,
  duration,
  rating,
  category,
  progress,
}: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex-shrink-0 w-[280px] lg:w-[320px] cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div
        className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
          isHovered ? "scale-105 shadow-card z-10" : ""
        }`}
      >
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
          
          {/* Play Button Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-glow">
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </div>

          {/* Progress Bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`bg-card p-4 transition-all duration-300 ${
          isHovered ? "bg-card" : ""
        }`}>
          {/* Category Badge */}
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {category}
          </span>

          {/* Title */}
          <h3 className="text-foreground font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Hover Actions */}
          <div className={`flex items-center gap-2 mt-3 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}>
            <Button size="sm" className="flex-1 gap-1">
              <Play className="h-4 w-4 fill-current" />
              Assistir
            </Button>
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
