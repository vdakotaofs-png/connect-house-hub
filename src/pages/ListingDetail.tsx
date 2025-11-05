import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, BedDouble, Bath, Maximize, Star, MessageCircle, Heart } from "lucide-react";
import Map from "@/components/Map";

interface ListingDetailProps {
  user: any;
}

const ListingDetail = ({ user }: ListingDetailProps) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchListing();
    }
  }, [slug]);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Listing not found",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setListing(data);

    // Update views
    await supabase
      .from("listings")
      .update({ views: data.views + 1 })
      .eq("id", data.id);

    // Fetch owner
    const { data: ownerData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.owner_id)
      .single();

    if (ownerData) setOwner(ownerData);

    // Fetch ratings
    const { data: ratingsData } = await supabase
      .from("ratings")
      .select("*, profiles!ratings_user_id_fkey(full_name)")
      .eq("listing_id", data.id)
      .order("created_at", { ascending: false });

    if (ratingsData) setRatings(ratingsData);

    // Check if favorite
    if (user) {
      const { data: favData } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", data.id)
        .single();

      setIsFavorite(!!favData);
    }

    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("messages").insert({
      listing_id: listing.id,
      sender_id: user.id,
      receiver_id: listing.owner_id,
      content: message,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Message sent!",
        description: "The host will receive your message.",
      });
      setMessage("");
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listing.id);
      setIsFavorite(false);
      toast({ title: "Removed from favorites" });
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorite(true);
      toast({ title: "Added to favorites" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!listing) return null;

  const avgRating = ratings.length > 0
    ? ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length
    : 0;

  const mainPhoto = listing.photos?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      {/* Photo Gallery */}
      <div className="relative h-[600px] overflow-hidden">
        <img src={mainPhoto} alt={listing.title} className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-10 left-8 right-8 text-white fade-in">
          <Badge className="mb-6 bg-white/95 text-primary backdrop-blur-sm shadow-medium font-semibold text-base px-4 py-2">
            {listing.type === "rent" ? "For Rent" : "For Sale"}
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">{listing.title}</h1>
          <p className="text-xl md:text-2xl flex items-center gap-2 text-purple-100">
            <MapPin className="h-6 w-6" />
            {listing.city}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Details */}
            <Card className="border-2 hover-lift">
              <CardHeader className="pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-4xl md:text-5xl gradient-text mb-4">
                      RD$ {listing.price_month.toLocaleString()}<span className="text-2xl text-muted-foreground">/mes</span>
                    </CardTitle>
                    <div className="flex flex-wrap gap-6 text-base text-muted-foreground">
                      {listing.bedrooms && (
                        <span className="flex items-center gap-2.5">
                          <BedDouble className="h-5 w-5 text-primary" />
                          <span className="font-medium">{listing.bedrooms} bed</span>
                        </span>
                      )}
                      {listing.bathrooms && (
                        <span className="flex items-center gap-2.5">
                          <Bath className="h-5 w-5 text-primary" />
                          <span className="font-medium">{listing.bathrooms} bath</span>
                        </span>
                      )}
                      {listing.area_m2 && (
                        <span className="flex items-center gap-2.5">
                          <Maximize className="h-5 w-5 text-primary" />
                          <span className="font-medium">{listing.area_m2}m²</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleFavorite} className="hover:bg-purple-50">
                    <Heart className={isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-3">Description</h3>
                  <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
                
                {listing.address && (
                  <div className="pt-4 border-t">
                    <h3 className="font-bold text-xl mb-3">Address</h3>
                    <p className="text-muted-foreground text-base">{listing.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-2 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  <span>Reviews ({ratings.length})</span>
                  {avgRating > 0 && (
                    <span className="text-muted-foreground text-lg font-normal">
                      - {avgRating.toFixed(1)} average
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length > 0 ? (
                  <div className="space-y-6">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar>
                            <AvatarFallback>
                              {rating.profiles?.full_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{rating.profiles?.full_name || "User"}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating.stars
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {rating.comment && <p className="text-muted-foreground">{rating.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            {listing.lat && listing.lng && (
              <Card className="border-2 hover-lift">
                <CardHeader>
                  <CardTitle className="text-2xl">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <Map latitude={Number(listing.lat)} longitude={Number(listing.lng)} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Host Card */}
            {owner && (
              <Card className="border-2 hover-lift">
                <CardHeader>
                  <CardTitle className="text-2xl">Hosted by</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-purple-100">
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                        {owner.full_name?.[0] || "H"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-xl">{owner.full_name}</p>
                      <p className="text-base text-muted-foreground capitalize">{owner.role}</p>
                    </div>
                  </div>
                  {owner.bio && (
                    <p className="text-base text-muted-foreground leading-relaxed">{owner.bio}</p>
                  )}
                  <Link to={`/profile/${owner.id}`}>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Contact Host */}
            {user?.id !== listing.owner_id && (
              <Card className="border-2 hover-lift bg-gradient-to-br from-purple-50/50 to-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Contact Host</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea
                      rows={4}
                      placeholder="Hi, I'm interested in this property..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button variant="hero" size="lg" className="w-full shadow-medium" onClick={handleSendMessage}>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    D House only connects tenants and hosts. No payment or booking involved.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
