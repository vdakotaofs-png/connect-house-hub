import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface EditListingProps {
  user: any;
}

const EditListing = ({ user }: EditListingProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null]);
  const [photoLabels] = useState([
    "Exterior/Facade",
    "Living Room", 
    "Kitchen",
    "Bedroom",
    "Bathroom"
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [user, id, navigate]);

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Listing not found",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (data.owner_id !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You can only edit your own listings",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setListing(data);
    // Fill photos array with existing photos
    const existingPhotos = data.photos || [];
    const filledPhotos = [...existingPhotos];
    while (filledPhotos.length < 5) {
      filledPhotos.push(null);
    }
    setPhotos(filledPhotos.slice(0, 5));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('listings')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload Error",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(fileName);

    const newPhotos = [...photos];
    newPhotos[index] = publicUrl;
    setPhotos(newPhotos);

    toast({
      title: "Success!",
      description: "Photo uploaded successfully.",
    });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate at least one photo
    const validPhotos = photos.filter(p => p !== null);
    if (validPhotos.length === 0) {
      toast({
        title: "Error",
        description: "Por favor sube al menos una foto (Exterior/Facade es requerida)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const listingData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      price_month: parseFloat(formData.get("price_month") as string),
      currency: "DOP",
      bedrooms: parseInt(formData.get("bedrooms") as string) || null,
      bathrooms: parseInt(formData.get("bathrooms") as string) || null,
      area_m2: parseFloat(formData.get("area_m2") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      status: formData.get("status") as string,
      photos: validPhotos,
    };

    const { error } = await supabase
      .from("listings")
      .update(listingData)
      .eq("id", id);

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
        description: "Your listing has been updated.",
      });
      navigate("/dashboard");
    }
  };

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 bg-gradient-to-b from-purple-50/30 to-white min-h-screen">
      <Card className="max-w-3xl mx-auto border-2 hover-lift fade-in">
        <CardHeader className="space-y-3">
          <CardTitle className="text-4xl gradient-text">Editar Publicación</CardTitle>
          <CardDescription className="text-base">
            Actualiza los detalles de tu propiedad
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propiedad *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={listing.title}
                placeholder="Hermoso apartamento de 2 habitaciones en el centro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={listing.description}
                placeholder="Describe tu propiedad, amenidades, vecindario..."
                required
              />
            </div>

            {/* Photo Upload - Structured */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg">Fotos de la Propiedad *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Actualiza las fotos de diferentes áreas de la propiedad. La foto de Exterior/Facade es obligatoria.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {photoLabels.map((label, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {label} {index === 0 && <span className="text-red-500">*</span>}
                    </Label>
                    {photos[index] ? (
                      <div className="relative group">
                        <img 
                          src={photos[index]!} 
                          alt={label} 
                          className="w-full h-48 object-cover rounded-lg border-2 border-purple-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          id={`photo-${index}`}
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, index)}
                          className="hidden"
                        />
                        <label htmlFor={`photo-${index}`} className="cursor-pointer block">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                          <p className="text-xs font-medium mb-1">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG up to 10MB
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Publicación *</Label>
                <Select name="type" defaultValue={listing.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">En Alquiler</SelectItem>
                    <SelectItem value="sale">En Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_month">Precio Mensual (RD$) *</Label>
                <Input
                  id="price_month"
                  name="price_month"
                  type="number"
                  defaultValue={listing.price_month}
                  placeholder="50000"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  defaultValue={listing.bedrooms || ""}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  defaultValue={listing.bathrooms || ""}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input
                  id="area_m2"
                  name="area_m2"
                  type="number"
                  defaultValue={listing.area_m2 || ""}
                  placeholder="85"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                name="city"
                defaultValue={listing.city}
                placeholder="Santo Domingo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Completa</Label>
              <Input
                id="address"
                name="address"
                defaultValue={listing.address || ""}
                placeholder="Calle Principal 123, Apto 4B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado de Publicación *</Label>
              <Select name="status" defaultValue={listing.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Guardar como Borrador</SelectItem>
                  <SelectItem value="published">Publicar Ahora</SelectItem>
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
                Cancelar
              </Button>
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="flex-1 shadow-medium">
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditListing;
