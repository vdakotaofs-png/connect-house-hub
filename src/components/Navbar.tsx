import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Heart, MessageCircle, User, LogOut, Plus } from "lucide-react";
import logo from "@/assets/logo.png";

interface NavbarProps {
  user: any;
}

const Navbar = ({ user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-100 shadow-medium">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="transition-smooth hover:opacity-90 hover:scale-105">
            <img src={logo} alt="D House" className="h-16 transition-all duration-300 drop-shadow-lg" />
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link to="/create-listing">
                  <Button variant="hero" size="sm" className="shadow-md hover:shadow-lg font-semibold">
                    <Plus className="mr-2 h-4 w-4" />
                    List Property
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="font-medium hover:bg-purple-50 hover:text-primary">
                    Home
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="font-medium border-2 hover:bg-primary hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm" className="shadow-md hover:shadow-lg font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
