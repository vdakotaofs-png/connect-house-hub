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
      <Card className="overflow-hidden hover:shadow-large transition-smooth cursor-pointer group">
        <div className="relative h-64 overflow-hidden">
          <img
            src={mainPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={toggleFavorite}
          >
            <Heart className={favorite ? "fill-red-500 text-red-500" : ""} />
          </Button>
          <Badge
            className="absolute top-2 left-2 bg-white/90 text-primary hover:bg-white"
          >
            {listing.type === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{listing.title}</h3>
          <p className="text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-4 w-4" />
            {listing.city}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {listing.bedrooms && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {listing.bedrooms} bed
              </span>
            )}
            {listing.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                {listing.bathrooms} bath
              </span>
            )}
            {listing.area_m2 && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                {listing.area_m2}m²
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <p className="text-2xl font-bold text-primary">
            {listing.currency} {listing.price_month.toLocaleString()}/mo
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ListingCard;
