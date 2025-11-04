import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingCard from "@/components/ListingCard";
import Footer from "@/components/Footer";
import { Search, Shield, Users, Home as HomeIcon, TrendingUp, Clock, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-home.jpg";

interface HomeProps {
  user: any;
}

const Home = ({ user }: HomeProps) => {
  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
    if (user) fetchFavorites();
  }, [user]);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id);

    if (data) {
      setFavorites(data.map((f) => f.listing_id));
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || listing.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      {/* Hero Section */}
      <section className="relative min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Background with parallax effect */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern Home"
            className="w-full h-full object-cover scale-110 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-purple-800/90 to-indigo-900/95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-400/30 via-transparent to-transparent"></div>
          
          {/* Animated decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-6xl px-4 py-20 fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6 animate-in slide-in-from-top duration-700">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">+{listings.length} propiedades disponibles</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight animate-in slide-in-from-bottom duration-700">
            Encuentra Tu <br />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 text-transparent bg-clip-text animate-gradient bg-300%">Hogar Perfecto</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl mb-12 text-purple-100 font-light max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-700 delay-100">
            Alquila o compra directamente con los dueños. 
            <span className="block mt-2 text-white font-medium">Sin comisiones. Sin intermediarios. Sin estrés.</span>
          </p>
          
          {/* Search Bar - Enhanced */}
          <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-2xl max-w-5xl mx-auto border-4 border-purple-200/50 hover:border-purple-300/70 transition-all duration-300 animate-in slide-in-from-bottom duration-700 delay-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Busca por ciudad o zona..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 text-base border-2 border-gray-200 focus:border-primary rounded-2xl bg-gray-50 font-medium"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-56 h-14 border-2 border-gray-200 rounded-2xl bg-gray-50 font-medium">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="rent">En Alquiler</SelectItem>
                  <SelectItem value="sale">En Venta</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="hero" className="h-14 px-8 md:px-12 text-base font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl">
                <Search className="mr-2 h-5 w-5" />
                Buscar Ahora
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-12 animate-in fade-in duration-1000 delay-300">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">{listings.length}+</div>
              <div className="text-sm md:text-base text-purple-200">Propiedades</div>
            </div>
            <div className="h-12 w-px bg-purple-300/30"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">500+</div>
              <div className="text-sm md:text-base text-purple-200">Usuarios Activos</div>
            </div>
            <div className="h-12 w-px bg-purple-300/30"></div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">0%</div>
              <div className="text-sm md:text-base text-purple-200">Comisiones</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg">
                <HomeIcon className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-2">{listings.length}+</h3>
              <p className="text-muted-foreground font-medium">Active Listings</p>
            </div>
            <div className="text-center fade-in" style={{animationDelay: '0.1s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-2">500+</h3>
              <p className="text-muted-foreground font-medium">Happy Users</p>
            </div>
            <div className="text-center fade-in" style={{animationDelay: '0.2s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-2">98%</h3>
              <p className="text-muted-foreground font-medium">Success Rate</p>
            </div>
            <div className="text-center fade-in" style={{animationDelay: '0.3s'}}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4 shadow-lg">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-bold gradient-text mb-2">24/7</h3>
              <p className="text-muted-foreground font-medium">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Why Choose D House?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make finding your perfect home simple, direct, and hassle-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-soft hover-lift border-2 border-transparent hover:border-primary/20 fade-in">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-medium">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">No Middlemen</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect directly with property owners. No agents, no fees, no commissions. Just pure, direct communication.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-soft hover-lift border-2 border-transparent hover:border-primary/20 fade-in" style={{animationDelay: '0.1s'}}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-medium">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Direct Messaging</h3>
              <p className="text-muted-foreground leading-relaxed">
                Chat with hosts instantly. Ask questions, schedule viewings, and negotiate terms directly.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-soft hover-lift border-2 border-transparent hover:border-primary/20 fade-in" style={{animationDelay: '0.2s'}}>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-medium">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Monthly Flexibility</h3>
              <p className="text-muted-foreground leading-relaxed">
                Perfect for digital nomads and flexible living. Find monthly rentals without long-term commitments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Available Properties</h2>
          <p className="text-lg text-muted-foreground">
            Browse {filteredListings.length} beautiful properties available for monthly rent or sale
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading properties...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                userId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No properties found matching your criteria.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;
