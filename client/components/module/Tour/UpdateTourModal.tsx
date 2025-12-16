/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateTourValidationSchema } from "@/zod/tour.validation";
import { UpdateTourInput, ITour, TourCategory, DifficultyLevel } from "@/types/tour.interface";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { updateTour } from "@/services/tour/hostTours";

interface UpdateTourModalProps {
  tour: ITour;
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'ADVENTURE', 'CULTURE', 'FOOD', 'NATURE', 'RELAXATION',
  'URBAN', 'BEACH', 'MOUNTAIN'
] as const;

const DIFFICULTIES = ['EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'] as const;

// Helper function to format date for input field
const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export default function UpdateTourModal({ tour, open, onClose }: UpdateTourModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(tour.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [includedItems, setIncludedItems] = useState<string[]>(tour.included || []);
  const [excludedItems, setExcludedItems] = useState<string[]>(tour.excluded || []);
  const [newIncludedItem, setNewIncludedItem] = useState("");
  const [newExcludedItem, setNewExcludedItem] = useState("");

  const form = useForm<UpdateTourInput>({
    resolver: zodResolver(updateTourValidationSchema),
    defaultValues: {
      title: tour.title,
      description: tour.description,
      destination: tour.destination,
      city: tour.city,
      country: tour.country,
      startDate: formatDateForInput(tour.startDate),
      endDate: formatDateForInput(tour.endDate),
      duration: tour.duration,
      price: tour.price,
      maxGroupSize: tour.maxGroupSize,
      category: tour.category as TourCategory,
      difficulty: tour.difficulty as DifficultyLevel,
      meetingPoint: tour.meetingPoint,
      isActive: tour.isActive,
      isFeatured: tour.isFeatured,
      itinerary: tour.itinerary,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.slice(0, 5 - images.length); // Limit to 5 images total
    
    setNewImages((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // Check if it's a new image or existing one
    const isNewImage = index >= (tour.images?.length || 0);
    
    if (isNewImage) {
      const newIndex = index - (tour.images?.length || 0);
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
    
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addIncludedItem = () => {
    if (newIncludedItem.trim()) {
      setIncludedItems([...includedItems, newIncludedItem.trim()]);
      setNewIncludedItem("");
    }
  };

  const removeIncludedItem = (index: number) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const addExcludedItem = () => {
    if (newExcludedItem.trim()) {
      setExcludedItems([...excludedItems, newExcludedItem.trim()]);
      setNewExcludedItem("");
    }
  };

  const removeExcludedItem = (index: number) => {
    setExcludedItems(excludedItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UpdateTourInput) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Filter out blob URLs (temporary previews) and keep only actual image URLs
      const filteredImages = images.filter(img => 
        !img.startsWith("blob:") && 
        !img.startsWith("data:") &&
        typeof img === 'string'
      );
      
      // Append form data
      const tourData: Record<string, any> = {
        ...data,
        included: includedItems,
        excluded: excludedItems,
        images: filteredImages.length > 0 ? filteredImages : undefined,
      };
      
      // Clean up the data - remove undefined values
      Object.keys(tourData).forEach(key => {
        if (tourData[key] === undefined || tourData[key] === null) {
          delete tourData[key];
        }
      });
      
      // Only append if there's data to update
      if (Object.keys(tourData).length > 0) {
        formData.append("data", JSON.stringify(tourData));
      }
      
      // Append new images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Also pass existing images separately for the backend to handle
      if (filteredImages.length > 0) {
        formData.append("existingImages", JSON.stringify(filteredImages));
      }

      const result = await updateTour(tour.id, formData);
      
      if (result.success) {
        toast.success(result.message || "Tour updated successfully!");
        onClose();
        router.refresh();
      } else {
        const errorMessage = result.errors 
          ? Object.values(result.errors).flat().join(", ")
          : result.message || "Failed to update tour";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Update tour error:", error);
      toast.error(error.message || "Failed to update tour. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Tour</DialogTitle>
          <DialogDescription>
            Make changes to your tour. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tour Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Amazing Mountain Adventure" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your tour in detail..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0) + category.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DIFFICULTIES.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0) + level.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location & Dates</h3>
                
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-10" placeholder="E.g., Himalayas" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Kathmandu" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Nepal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="date" 
                              className="pl-10" 
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="date" 
                              className="pl-10" 
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="meetingPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Point</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Hotel Lobby, Airport, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing & Group Size */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing & Group</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min="1"
                            className="pl-10" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per person</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min="0"
                            step="0.01"
                            className="pl-10" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxGroupSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Group Size</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            min="1"
                            className="pl-10" 
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* What's Included/Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's Included</h3>
                <div className="space-y-3">
                  {includedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIncludedItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add included item..."
                      value={newIncludedItem}
                      onChange={(e) => setNewIncludedItem(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIncludedItem())}
                    />
                    <Button type="button" onClick={addIncludedItem} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's Excluded</h3>
                <div className="space-y-3">
                  {excludedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExcludedItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add excluded item..."
                      value={newExcludedItem}
                      onChange={(e) => setNewExcludedItem(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExcludedItem())}
                    />
                    <Button type="button" onClick={addExcludedItem} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Tour Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images. First image will be used as the cover.
                  </p>
                </div>
                <Badge variant="outline">
                  {images.length} / 5 images
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                      {image ? (
                        <Image
                          src={image}
                          alt={`Tour image ${index + 1}`}
                          width={150}
                          height={150}
                          className="object-cover w-full h-full"
                          unoptimized={image.startsWith('blob:') || image.startsWith('data:')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-muted/30">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            {/* Status & Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status & Features</h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Tour</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this tour visible to the public
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Tour</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Highlight this tour on the homepage
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Tour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}