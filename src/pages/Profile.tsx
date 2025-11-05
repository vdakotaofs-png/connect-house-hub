import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ListingCard from "@/components/ListingCard";
import { MapPin, Star } from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchListings();
    }
  }, [id]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  };

  const fetchListings = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("owner_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data) setListings(data);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <Link to="/" className="text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="mb-8 border-2 hover-lift">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="h-32 w-32 border-4 border-purple-100">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                  {profile.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold gradient-text">
                    {profile.full_name || "User"}
                  </h1>
                  {profile.role && (
                    <Badge className="bg-purple-100 text-primary border-purple-200">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                
                {profile.phone && (
                  <p className="text-base text-muted-foreground">
                    📞 {profile.phone}
                  </p>
                )}
                
                <div className="mt-4 text-sm text-muted-foreground">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        <div>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Properties ({listings.length})
          </h2>
          
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-2 border-dashed">
              <p className="text-muted-foreground text-lg">
                This user hasn't posted any properties yet.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
