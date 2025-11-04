import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface CreateListingProps {
  user: any;
}

const CreateListing = ({ user }: CreateListingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const listingData = {
      owner_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      price_month: parseFloat(formData.get("price_month") as string),
      currency: "USD",
      bedrooms: parseInt(formData.get("bedrooms") as string) || null,
      bathrooms: parseInt(formData.get("bathrooms") as string) || null,
      area_m2: parseFloat(formData.get("area_m2") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      status: formData.get("status") as string,
      photos: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6"], // Placeholder
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(listingData)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Your listing has been created.",
      });
      navigate("/dashboard");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 bg-gradient-to-b from-purple-50/30 to-white min-h-screen">
      <Card className="max-w-3xl mx-auto border-2 hover-lift fade-in">
        <CardHeader className="space-y-3">
          <CardTitle className="text-4xl gradient-text">Create New Listing</CardTitle>
          <CardDescription className="text-base">
            List your property for monthly rent or sale
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Beautiful 2-bedroom apartment in downtown"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your property, amenities, neighborhood..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Listing Type *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_month">Precio Mensual (RD$) *</Label>
                <Input
                  id="price_month"
                  name="price_month"
                  type="number"
                  placeholder="50000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_m2">Area (m²)</Label>
                <Input
                  id="area_m2"
                  name="area_m2"
                  type="number"
                  placeholder="85"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                placeholder="New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Publish Status *</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="published">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="flex-1 shadow-medium">
                {loading ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListing;
