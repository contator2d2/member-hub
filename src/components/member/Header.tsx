import { Bell, Search, User, Settings, LogOut, Upload } from "lucide-react";
import { useBranding } from "@/components/BrandingContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const Header = () => {
  const { branding, updateBranding } = useBranding();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBranding({ logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-sm shadow-lg" : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.brandName}
                  className="h-8 lg:h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-8 lg:h-10 w-8 lg:w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {branding.brandName.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-foreground font-semibold text-lg hidden sm:block">
                {branding.brandName}
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground font-medium hover:text-primary transition-colors">
                Início
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Cursos
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Minha Lista
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Comunidade
              </a>
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className={`flex items-center transition-all duration-300 ${showSearch ? "w-48 lg:w-64" : "w-auto"}`}>
              {showSearch ? (
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-10 bg-secondary border-none"
                    autoFocus
                    onBlur={() => setShowSearch(false)}
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="text-foreground hover:text-primary"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="text-foreground hover:text-primary relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">João Silva</p>
                  <p className="text-xs text-muted-foreground">joao@email.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações de Branding
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurações de Branding</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Logo da Marca</Label>
                        <div className="flex items-center gap-4">
                          {branding.logoUrl ? (
                            <img
                              src={branding.logoUrl}
                              alt="Logo"
                              className="h-12 w-12 object-contain rounded-lg bg-secondary p-1"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Enviar Logo
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Nome da Marca</Label>
                        <Input
                          id="brandName"
                          value={branding.brandName}
                          onChange={(e) => updateBranding({ brandName: e.target.value })}
                          placeholder="Nome da sua marca"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
