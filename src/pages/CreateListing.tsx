import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface CreateListingProps {
  user: any;
}

const CreateListing = ({ user }: CreateListingProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [type, setType] = useState("rent");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 10) {
      toast({
        title: "Límite excedido",
        description: "Puedes subir máximo 10 fotos",
        variant: "destructive",
      });
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "Error",
        description: "Debes subir al menos 1 foto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName);
        
        photoUrls.push(publicUrl);
      }

      // Create slug from title
      const title = formData.get("title") as string;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now()}`;

      const listing = {
        title,
        description: formData.get("description") as string,
        price_month: Number(formData.get("price_month")),
        type,
        bedrooms: Number(formData.get("bedrooms")) || null,
        bathrooms: Number(formData.get("bathrooms")) || null,
        area_m2: Number(formData.get("area_m2")) || null,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        lat: Number(formData.get("lat")) || null,
        lng: Number(formData.get("lng")) || null,
        photos: photoUrls,
        owner_id: user.id,
        slug: slug,
        status: "published",
        currency: "DOP",
      };

      const { error } = await supabase.from("listings").insert(listing);

      if (error) throw error;

      toast({
        title: "¡Publicación creada!",
        description: "Tu propiedad ha sido publicada exitosamente.",
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 fade-in">
          <h1 className="text-5xl font-bold mb-2 gradient-text">Nueva Publicación</h1>
          <p className="text-lg text-muted-foreground">Comparte tu propiedad con nuestra comunidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-soft p-8 border-2">
          {/* Photos Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Fotos de la propiedad *</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Sube hasta 10 fotos. La primera será la foto principal.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-transparent text-white text-xs py-2 text-center font-semibold">
                      Foto Principal
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {photos.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-purple-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all group">
                  <Upload className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-gray-500 font-medium">Subir fotos</span>
                  <span className="text-xs text-gray-400">{photos.length}/10</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" name="title" required placeholder="Ej: Apartamento moderno en Piantini" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">En Alquiler</SelectItem>
                  <SelectItem value="sale">En Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              required
              placeholder="Describe tu propiedad con detalle..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price_month">Precio Mensual (RD$) *</Label>
              <Input id="price_month" name="price_month" type="number" required placeholder="25000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input id="city" name="city" required placeholder="Santo Domingo" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección Completa *</Label>
            <Input id="address" name="address" required placeholder="Calle Principal #123, Sector" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Habitaciones</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min="0" placeholder="3" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Baños</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" placeholder="2" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="area_m2">Área (m²)</Label>
              <Input id="area_m2" name="area_m2" type="number" placeholder="120" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Ubicación en el mapa (opcional)</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Puedes obtener las coordenadas desde Google Maps haciendo clic derecho en el mapa
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitud</Label>
                <Input id="lat" name="lat" type="number" step="any" placeholder="18.4861" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lng">Longitud</Label>
                <Input id="lng" name="lng" type="number" step="any" placeholder="-69.9312" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1"
              size="lg"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="hero" disabled={loading} className="flex-1" size="lg">
              {loading ? "Publicando..." : "Publicar Propiedad"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
