import { Play, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] lg:h-[85vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Featured content"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-2xl pt-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
            <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Novo Conteúdo</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
            Domine as Habilidades
            <br />
            <span className="text-primary">do Futuro</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 max-w-lg">
            Acesso ilimitado a cursos exclusivos, mentorias e uma comunidade
            engajada para impulsionar sua carreira.
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="gap-2 shadow-glow">
              <Play className="h-5 w-5 fill-current" />
              Assistir Agora
            </Button>
            <Button size="lg" variant="secondary" className="gap-2">
              <Plus className="h-5 w-5" />
              Minha Lista
            </Button>
            <Button size="lg" variant="ghost" className="gap-2">
              <Info className="h-5 w-5" />
              Mais Informações
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-foreground">150+</p>
              <p className="text-sm text-muted-foreground">Cursos</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">50k+</p>
              <p className="text-sm text-muted-foreground">Alunos</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-3xl font-bold text-foreground">4.9</p>
              <p className="text-sm text-muted-foreground">Avaliação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
