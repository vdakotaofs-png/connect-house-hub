import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Heart, MessageCircle, User, LogOut, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-lg">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-smooth hover:opacity-90 hover:scale-105 z-50">
            <img src={logo} alt="D House" className="h-16 sm:h-20 transition-all duration-300 drop-shadow-2xl" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary transition-all">
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary transition-all">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary transition-all">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mensajes
                  </Button>
                </Link>
                
                <div className="h-6 w-px bg-purple-200 mx-2"></div>
                
                <Link to="/create-listing">
                  <Button variant="hero" size="sm" className="shadow-md hover:shadow-xl font-semibold transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="font-medium border-2 hover:bg-purple-50 transition-all">
                    <User className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600 transition-all">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary transition-all">
                    Inicio
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="font-medium border-2 hover:bg-primary hover:text-white transition-all">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="shadow-md hover:shadow-xl font-semibold transition-all">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-purple-50 transition-colors z-50"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/98 backdrop-blur-xl border-b border-purple-100 shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="container mx-auto px-4 py-6 space-y-2">
              {user ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-medium hover:bg-purple-50 hover:text-primary transition-all">
                      <Home className="mr-3 h-5 w-5" />
                      Inicio
                    </Button>
                  </Link>
                  <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-medium hover:bg-purple-50 hover:text-primary transition-all">
                      <Heart className="mr-3 h-5 w-5" />
                      Favoritos
                    </Button>
                  </Link>
                  <Link to="/messages" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-medium hover:bg-purple-50 hover:text-primary transition-all">
                      <MessageCircle className="mr-3 h-5 w-5" />
                      Mensajes
                    </Button>
                  </Link>
                  <div className="border-t border-purple-100 my-3"></div>
                  <Link to="/create-listing" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full shadow-md font-semibold">
                      <Plus className="mr-3 h-5 w-5" />
                      Publicar Propiedad
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start font-medium border-2">
                      <User className="mr-3 h-5 w-5" />
                      Mi Cuenta
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-red-50 hover:text-red-600 transition-all" 
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start font-medium hover:bg-purple-50 hover:text-primary transition-all">
                      Inicio
                    </Button>
                  </Link>
                  <div className="border-t border-purple-100 my-3"></div>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full font-medium border-2">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="hero" className="w-full shadow-md font-semibold">
                      Registrarse Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
