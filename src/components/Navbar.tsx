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
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-white via-purple-50/30 to-white backdrop-blur-sm border-b-2 border-purple-200/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo - Más grande y prominente */}
          <Link to="/" className="flex-shrink-0 transition-all duration-300 hover:scale-110 hover:drop-shadow-2xl">
            <img src={logo} alt="D House" className="h-20 sm:h-24 lg:h-28 w-auto drop-shadow-xl" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-purple-100 transition-all font-medium">
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-purple-100 transition-all font-medium">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-purple-100 transition-all font-medium">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mensajes
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-purple-100 transition-all font-medium">
                    <User className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Button>
                </Link>
                
                <div className="h-8 w-px bg-purple-300/50 mx-2"></div>
                
                <Link to="/create-listing">
                  <Button variant="hero" size="sm" className="shadow-lg hover:shadow-xl font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    Publicar
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  className="ml-1 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-purple-100 transition-all font-medium">
                    Inicio
                  </Button>
                </Link>
                
                <div className="h-8 w-px bg-purple-300/50 mx-2"></div>
                
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all font-semibold">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="shadow-lg hover:shadow-xl font-semibold">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:bg-purple-100"
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-purple-200 bg-gradient-to-b from-purple-50/50 to-white backdrop-blur-lg">
            <div className="px-4 py-5 space-y-2">
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
