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
      {/* Hero Section - Airbnb Inspired */}
      <section className="relative min-h-[650px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FF385C]/5 via-purple-50 to-[#00A699]/5">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern Home"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20 fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Encuentra tu próximo
              <span className="block bg-gradient-to-r from-[#FF385C] via-purple-600 to-[#00A699] text-transparent bg-clip-text">
                hogar en RD
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-gray-700 font-light">
              Alquila directo con dueños. <span className="font-semibold">Sin comisiones.</span>
            </p>
            
            {/* Enhanced Search Bar - Airbnb Style */}
            <div className="bg-white rounded-full p-2 shadow-2xl max-w-4xl mx-auto border">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="¿Dónde quieres vivir?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-14 pr-6 text-base border-0 rounded-full focus-visible:ring-0 font-medium placeholder:text-gray-400"
                  />
                </div>
                <div className="w-full md:w-auto flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-16 px-6 border-0 rounded-full bg-gray-50 font-medium min-w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="rent">Alquiler</SelectItem>
                      <SelectItem value="sale">Venta</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="default" className="h-16 px-8 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E31C5F] hover:from-[#E31C5F] hover:to-[#D70466] text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Categories - Airbnb Style */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { name: "🏖️ Playa", filter: "beach" },
                { name: "🏙️ Ciudad", filter: "city" },
                { name: "🏡 Casa", filter: "house" },
                { name: "🏢 Apartamento", filter: "apartment" },
                { name: "💎 Premium", filter: "premium" }
              ].map((category) => (
                <button
                  key={category.filter}
                  className="px-6 py-3 bg-white rounded-full border-2 border-gray-200 hover:border-gray-900 transition-all font-medium text-sm hover:shadow-md"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators - Airbnb Style */}
      <section className="py-8 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">{listings.length}+</div>
              <div className="text-sm text-gray-600">Propiedades</div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">Usuarios</div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">0%</div>
              <div className="text-sm text-gray-600">Comisiones</div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Airbnb Style */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Por qué D House?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conectamos personas, sin intermediarios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF385C] to-[#E31C5F] flex items-center justify-center mb-6 mx-auto shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Sin Comisiones</h3>
              <p className="text-gray-600 leading-relaxed">
                Conecta directo con propietarios. Sin agentes, sin fees escondidos.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 mx-auto shadow-lg">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Chat Directo</h3>
              <p className="text-gray-600 leading-relaxed">
                Habla con los dueños al instante. Pregunta, negocia y coordina visitas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00A699] to-[#008B80] flex items-center justify-center mb-6 mx-auto shadow-lg">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Alquiler Mensual</h3>
              <p className="text-gray-600 leading-relaxed">
                Flexibilidad total. Ideal para nómadas digitales y contratos cortos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">Propiedades disponibles</h2>
          <p className="text-xl text-gray-600">
            {filteredListings.length} propiedades esperando por ti
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
