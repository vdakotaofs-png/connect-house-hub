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
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern Home"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-800/85 to-indigo-900/90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-5xl px-4 fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Next <span className="text-purple-300">Dream</span> Home
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-purple-100 font-light">
            Monthly rentals and sales. Connect directly — no fees, no middlemen.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-large max-w-4xl mx-auto border border-white/20 hover-lift">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by city or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 text-base border-2 focus:border-primary"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48 h-14 border-2">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="hero" className="h-14 px-10 text-base font-semibold shadow-medium hover:shadow-large">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
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
