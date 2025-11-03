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
    <div className="min-h-screen bg-gray-50">
      {/* Photo Gallery */}
      <div className="relative h-[500px] overflow-hidden">
        <img src={mainPhoto} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <Badge className="mb-4 bg-white/90 text-primary">
            {listing.type === "rent" ? "For Rent" : "For Sale"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{listing.title}</h1>
          <p className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {listing.city}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl text-primary">
                      ${listing.price_month.toLocaleString()}/month
                    </CardTitle>
                    <div className="flex gap-6 mt-4 text-muted-foreground">
                      {listing.bedrooms && (
                        <span className="flex items-center gap-2">
                          <BedDouble className="h-5 w-5" />
                          {listing.bedrooms} bed
                        </span>
                      )}
                      {listing.bathrooms && (
                        <span className="flex items-center gap-2">
                          <Bath className="h-5 w-5" />
                          {listing.bathrooms} bath
                        </span>
                      )}
                      {listing.area_m2 && (
                        <span className="flex items-center gap-2">
                          <Maximize className="h-5 w-5" />
                          {listing.area_m2}m²
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                    <Heart className={isFavorite ? "fill-red-500 text-red-500" : ""} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
                
                {listing.address && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Address</h3>
                    <p className="text-muted-foreground">{listing.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  Reviews ({ratings.length})
                  {avgRating > 0 && (
                    <span className="text-muted-foreground text-base">
                      - {avgRating.toFixed(1)} average
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length > 0 ? (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b pb-4 last:border-0">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card */}
            {owner && (
              <Card>
                <CardHeader>
                  <CardTitle>Hosted by</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl">
                        {owner.full_name?.[0] || "H"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{owner.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{owner.role}</p>
                    </div>
                  </div>
                  {owner.bio && (
                    <p className="text-sm text-muted-foreground">{owner.bio}</p>
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
              <Card>
                <CardHeader>
                  <CardTitle>Contact Host</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Message</Label>
                    <Textarea
                      rows={4}
                      placeholder="Hi, I'm interested in this property..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleSendMessage}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
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
