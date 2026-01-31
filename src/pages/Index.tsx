import { BrandingProvider } from "@/components/BrandingContext";
import Header from "@/components/member/Header";
import HeroSection from "@/components/member/HeroSection";
import ContentRow from "@/components/member/ContentRow";

const Index = () => {
  return (
    <BrandingProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          
          <div className="-mt-20 relative z-10">
            <ContentRow
              title="Continue Assistindo"
              subtitle="Retome de onde parou"
            />
            
            <ContentRow
              title="Recomendados para Você"
              subtitle="Baseado no seu histórico"
            />
            
            <ContentRow
              title="Mais Populares"
              subtitle="Os favoritos da comunidade"
            />
            
            <ContentRow
              title="Lançamentos Recentes"
              subtitle="Novos conteúdos adicionados"
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-12 py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Sua Marca. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacidade
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Suporte
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrandingProvider>
  );
};

export default Index;
