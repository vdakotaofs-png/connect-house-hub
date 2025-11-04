import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    slug: string;
    type: string;
    price_month: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    area_m2: number;
    city: string;
    photos: string[];
  };
  isFavorite?: boolean;
  userId?: string;
}

const ListingCard = ({ listing, isFavorite, userId }: ListingCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const { toast } = useToast();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (favorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", listing.id);

      if (!error) {
        setFavorite(false);
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, listing_id: listing.id });

      if (!error) {
        setFavorite(true);
        toast({ title: "Added to favorites" });
      }
    }
  };

  const mainPhoto = listing.photos?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";

  return (
    <Link to={`/listing/${listing.slug}`}>
      <Card className="overflow-hidden hover-lift cursor-pointer group border-2 hover:border-primary/20 transition-smooth fade-in">
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-50 to-white">
          <img
            src={mainPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-smooth"></div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/95 hover:bg-white shadow-medium backdrop-blur-sm"
            onClick={toggleFavorite}
          >
            <Heart className={favorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-600"} />
          </Button>
          <Badge
            className="absolute top-3 left-3 bg-white/95 text-primary hover:bg-white shadow-medium backdrop-blur-sm font-semibold"
          >
            {listing.type === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-primary transition-smooth">{listing.title}</h3>
          <p className="text-muted-foreground flex items-center gap-1.5 mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{listing.city}</span>
          </p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            {listing.bedrooms && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.bedrooms} bed</span>
              </span>
            )}
            {listing.bathrooms && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.bathrooms} bath</span>
              </span>
            )}
            {listing.area_m2 && (
              <span className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-primary" />
                <span className="font-medium">{listing.area_m2}m²</span>
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 border-t mt-2">
          <p className="text-2xl font-bold gradient-text">
            {listing.currency} {listing.price_month.toLocaleString()}<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ListingCard;
