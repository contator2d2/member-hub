import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentCard from "./ContentCard";
import { useRef, useState } from "react";

// Import course images
import course1 from "@/assets/content/course-1.jpg";
import course2 from "@/assets/content/course-2.jpg";
import course3 from "@/assets/content/course-3.jpg";
import course4 from "@/assets/content/course-4.jpg";
import course5 from "@/assets/content/course-5.jpg";
import course6 from "@/assets/content/course-6.jpg";

interface ContentRowProps {
  title: string;
  subtitle?: string;
}

const courseImages = [course1, course2, course3, course4, course5, course6];

const mockContent = [
  {
    id: "1",
    title: "Comunicação e Oratória para Líderes",
    duration: "4h 30min",
    rating: 4.9,
    category: "Liderança",
    progress: 65,
  },
  {
    id: "2",
    title: "Marketing Digital Avançado",
    duration: "6h 15min",
    rating: 4.8,
    category: "Marketing",
  },
  {
    id: "3",
    title: "Finanças e Investimentos",
    duration: "5h 45min",
    rating: 4.7,
    category: "Finanças",
    progress: 30,
  },
  {
    id: "4",
    title: "Gestão de Equipes de Alta Performance",
    duration: "3h 20min",
    rating: 4.9,
    category: "Gestão",
  },
  {
    id: "5",
    title: "Desenvolvimento Pessoal e Mindset",
    duration: "4h 00min",
    rating: 4.8,
    category: "Desenvolvimento",
  },
  {
    id: "6",
    title: "Programação e Tecnologia",
    duration: "8h 30min",
    rating: 4.9,
    category: "Tecnologia",
  },
];

const ContentRow = ({ title, subtitle }: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 680;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6">
      {/* Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <a
            href="#"
            className="text-sm text-primary hover:underline transition-colors"
          >
            Ver Todos
          </a>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left Arrow */}
        <Button
          variant="secondary"
          size="icon"
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
            showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 lg:px-8 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {mockContent.map((content, index) => (
            <ContentCard
              key={content.id}
              {...content}
              thumbnail={courseImages[index % courseImages.length]}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="secondary"
          size="icon"
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full shadow-lg transition-all duration-300 ${
            showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </section>
  );
};

export default ContentRow;
