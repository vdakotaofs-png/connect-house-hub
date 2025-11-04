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
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105">
            <img src={logo} alt="D House" className="h-16 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-purple-50">
                    <Home className="mr-1.5 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-purple-50">
                    <Heart className="mr-1.5 h-4 w-4" />
                    Favoritos
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-purple-50">
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Mensajes
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-purple-50">
                    <User className="mr-1.5 h-4 w-4" />
                    Mi Cuenta
                  </Button>
                </Link>
                <Link to="/create-listing">
                  <Button variant="hero" className="ml-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Publicar
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="ml-1 text-gray-700 hover:text-red-600 hover:bg-red-50"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-purple-50">
                    Inicio
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" className="ml-2 border-primary text-primary hover:bg-primary hover:text-white">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" className="ml-2">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-1">
              {user ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-primary">
                      <Home className="mr-2 h-5 w-5" />
                      Inicio
                    </Button>
                  </Link>
                  <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-primary">
                      <Heart className="mr-2 h-5 w-5" />
                      Favoritos
                    </Button>
                  </Link>
                  <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-primary">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Mensajes
                    </Button>
                  </Link>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-primary">
                      <User className="mr-2 h-5 w-5" />
                      Mi Cuenta
                    </Button>
                  </Link>
                  <div className="pt-2 pb-2">
                    <Link to="/create-listing" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button variant="hero" className="w-full">
                        <Plus className="mr-2 h-5 w-5" />
                        Publicar Propiedad
                      </Button>
                    </Link>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:bg-red-50" 
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-purple-50 hover:text-primary">
                      Inicio
                    </Button>
                  </Link>
                  <div className="pt-2 space-y-2">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block">
                      <Button variant="hero" className="w-full">
                        Registrarse
                      </Button>
                    </Link>
                  </div>
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
