import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ListingCard from "@/components/ListingCard";
import { Edit, Trash2 } from "lucide-react";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchMyListings();
  }, [user, navigate]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
  };

  const fetchMyListings = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setMyListings(data);
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get("full_name") as string,
      role: formData.get("role") as string,
      bio: formData.get("bio") as string,
      phone: formData.get("phone") as string,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      fetchProfile();
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    const { error } = await supabase.from("listings").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted.",
      });
      fetchMyListings();
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 fade-in">
        <h1 className="text-5xl font-bold mb-2 gradient-text">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage your properties and profile</p>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12 bg-purple-50">
          <TabsTrigger value="listings" className="text-base">My Listings</TabsTrigger>
          <TabsTrigger value="profile" className="text-base">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-6 bg-gradient-to-r from-purple-50 to-white rounded-xl border">
            <div>
              <h2 className="text-3xl font-bold mb-1">Your Properties</h2>
              <p className="text-base text-muted-foreground">
                Manage your {myListings.length} {myListings.length === 1 ? 'listing' : 'listings'}
              </p>
            </div>
            <Button variant="hero" size="lg" onClick={() => navigate("/create-listing")} className="shadow-medium">
              Create New Listing
            </Button>
          </div>

          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myListings.map((listing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing} userId={user.id} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteListing(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Edit className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't created any listings yet. Start by creating your first property.
                </p>
                <Button variant="hero" size="lg" onClick={() => navigate("/create-listing")} className="shadow-medium">
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-8">
          <Card className="max-w-2xl border-2 hover-lift">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl">Profile Settings</CardTitle>
              <CardDescription className="text-base">
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {profile && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      defaultValue={profile.full_name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select name="role" defaultValue={profile.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={profile.phone || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      defaultValue={profile.bio || ""}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" disabled={loading} className="shadow-medium">
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
