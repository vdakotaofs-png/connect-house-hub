import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ListingCard from "@/components/ListingCard";

interface FavoritesProps {
  user: any;
}

const Favorites = ({ user }: FavoritesProps) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("favorites")
      .select("*, listings(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setFavorites(data.filter((f) => f.listings));
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Favorites</h1>
        <p className="text-muted-foreground">
          Properties you've saved for later
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <ListingCard
              key={fav.id}
              listing={fav.listings}
              isFavorite={true}
              userId={user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You haven't saved any favorites yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
