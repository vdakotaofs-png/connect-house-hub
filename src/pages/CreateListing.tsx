import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface CreateListingProps {
  user: any;
}

const CreateListing = ({ user }: CreateListingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null]);
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
    }
  }, [user, navigate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
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

    try {
      // Upload photos to storage
      const photoUrls: string[] = [];
      for (const photo of validPhotos) {
        if (photo) {
          const fileName = `${user.id}/${Date.now()}-${photo.name}`;
          const { error: uploadError } = await supabase.storage
            .from('listings')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('listings')
            .getPublicUrl(fileName);

          photoUrls.push(publicUrl);
        }
      }

      const listingData = {
        owner_id: user.id,
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
        photos: photoUrls,
      };

      const { error } = await supabase
        .from("listings")
        .insert(listingData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your listing has been created.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10 bg-gradient-to-b from-purple-50/30 to-white min-h-screen">
      <Card className="max-w-3xl mx-auto border-2 hover-lift fade-in">
        <CardHeader className="space-y-3">
          <CardTitle className="text-4xl gradient-text">Publica Tu Propiedad</CardTitle>
          <CardDescription className="text-base">
            Comparte los detalles de tu propiedad para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propiedad *</Label>
              <Input
                id="title"
                name="title"
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
                placeholder="Describe tu propiedad, amenidades, vecindario..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Publicación *</Label>
                <Select name="type" defaultValue="rent">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
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
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input
                  id="area_m2"
                  name="area_m2"
                  type="number"
                  placeholder="85"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Santo Domingo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección Completa</Label>
              <Input
                id="address"
                name="address"
                placeholder="Calle Principal 123, Apto 4B"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado de Publicación *</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Guardar como Borrador</SelectItem>
                  <SelectItem value="published">Publicar Ahora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload - Structured */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg">Fotos de la Propiedad *</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube fotos de diferentes áreas de la propiedad. La foto de Exterior/Facade es obligatoria.
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
                          src={URL.createObjectURL(photos[index]!)} 
                          alt={label} 
                          className="w-full h-48 object-cover rounded-lg border-2 border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
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
              <Button type="submit" variant="hero" size="lg" disabled={loading} className="shadow-medium">
                {loading ? "Creando..." : "Crear Publicación"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListing;
