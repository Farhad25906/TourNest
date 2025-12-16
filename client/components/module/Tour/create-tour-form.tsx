"use client";

import { createTour } from "@/services/tour/createTour";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import InputFieldError from "@/components/shared/InputFieldError";


const CATEGORIES = [
    'ADVENTURE', 'CULTURE', 'FOOD', 'NATURE', 'RELAXATION',
    'URBAN', 'BEACH', 'MOUNTAIN'
] as const;

const DIFFICULTIES = ['EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'] as const;

export default function CreateTourForm() {
    const [state, formAction, isPending] = useActionState(createTour, null);
    const [includedItems, setIncludedItems] = useState<string[]>(['']);
    const [excludedItems, setExcludedItems] = useState<string[]>(['']);
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        if (state && !state.success && state.message) {
            toast.error(state.message);
        } else if (state && state.success) {
            toast.success(state.message);
        }
    }, [state]);

    const addIncludedItem = () => {
        setIncludedItems([...includedItems, '']);
    };

    const removeIncludedItem = (index: number) => {
        const newItems = includedItems.filter((_, i) => i !== index);
        setIncludedItems(newItems);
    };

    const updateIncludedItem = (index: number, value: string) => {
        const newItems = [...includedItems];
        newItems[index] = value;
        setIncludedItems(newItems);
    };

    const addExcludedItem = () => {
        setExcludedItems([...excludedItems, '']);
    };

    const removeExcludedItem = (index: number) => {
        const newItems = excludedItems.filter((_, i) => i !== index);
        setExcludedItems(newItems);
    };

    const updateExcludedItem = (index: number, value: string) => {
        const newItems = [...excludedItems];
        newItems[index] = value;
        setExcludedItems(newItems);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImages(prev => [...prev, ...filesArray]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <form action={formAction} className="space-y-6">
            <FieldGroup>
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Field>
                        <FieldLabel htmlFor="title">Tour Title *</FieldLabel>
                        <Input id="title" name="title" type="text" placeholder="Amazing Bali Adventure" required />
                        <InputFieldError field="title" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="destination">Destination *</FieldLabel>
                        <Input id="destination" name="destination" type="text" placeholder="Bali, Indonesia" required />
                        <InputFieldError field="destination" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="city">City *</FieldLabel>
                        <Input id="city" name="city" type="text" placeholder="Ubud" required />
                        <InputFieldError field="city" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="country">Country *</FieldLabel>
                        <Input id="country" name="country" type="text" placeholder="Indonesia" required />
                        <InputFieldError field="country" state={state} />
                    </Field>
                </div>

                {/* Description */}
                <Field className="md:col-span-2">
                    <FieldLabel htmlFor="description">Description *</FieldLabel>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your tour in detail..."
                        rows={4}
                        required
                    />
                    <InputFieldError field="description" state={state} />
                </Field>

                {/* Dates and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Field>
                        <FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
                        <Input id="startDate" name="startDate" type="datetime-local" required />
                        <InputFieldError field="startDate" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="endDate">End Date *</FieldLabel>
                        <Input id="endDate" name="endDate" type="datetime-local" required />
                        <InputFieldError field="endDate" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="duration">Duration (days) *</FieldLabel>
                        <Input 
                            id="duration" 
                            name="duration" 
                            type="number" 
                            min="1" 
                            placeholder="7" 
                            required 
                        />
                        <InputFieldError field="duration" state={state} />
                    </Field>
                </div>

                {/* Pricing and Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Field>
                        <FieldLabel htmlFor="price">Price ($) *</FieldLabel>
                        <Input 
                            id="price" 
                            name="price" 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="999.99" 
                            required 
                        />
                        <InputFieldError field="price" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="maxGroupSize">Maximum Group Size *</FieldLabel>
                        <Input 
                            id="maxGroupSize" 
                            name="maxGroupSize" 
                            type="number" 
                            min="1" 
                            placeholder="20" 
                            required 
                        />
                        <InputFieldError field="maxGroupSize" state={state} />
                    </Field>
                </div>

                {/* Category and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Field>
                        <FieldLabel htmlFor="category">Category *</FieldLabel>
                        <Select name="category" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category.charAt(0) + category.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputFieldError field="category" state={state} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="difficulty">Difficulty Level *</FieldLabel>
                        <Select name="difficulty" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                {DIFFICULTIES.map(difficulty => (
                                    <SelectItem key={difficulty} value={difficulty}>
                                        {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputFieldError field="difficulty" state={state} />
                    </Field>
                </div>

                {/* Included Items */}
                <Field>
                    <FieldLabel>What's Included</FieldLabel>
                    <FieldDescription>Add items included in the tour</FieldDescription>
                    <div className="space-y-2">
                        {includedItems.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    name="included"
                                    value={item}
                                    onChange={(e) => updateIncludedItem(index, e.target.value)}
                                    placeholder={`Included item ${index + 1}`}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeIncludedItem(index)}
                                    disabled={includedItems.length === 1}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addIncludedItem}>
                            Add Included Item
                        </Button>
                    </div>
                    <InputFieldError field="included" state={state} />
                </Field>

                {/* Excluded Items */}
                <Field>
                    <FieldLabel>What's Excluded</FieldLabel>
                    <FieldDescription>Add items not included in the tour</FieldDescription>
                    <div className="space-y-2">
                        {excludedItems.map((item, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    name="excluded"
                                    value={item}
                                    onChange={(e) => updateExcludedItem(index, e.target.value)}
                                    placeholder={`Excluded item ${index + 1}`}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeExcludedItem(index)}
                                    disabled={excludedItems.length === 1}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addExcludedItem}>
                            Add Excluded Item
                        </Button>
                    </div>
                    <InputFieldError field="excluded" state={state} />
                </Field>

                {/* Meeting Point */}
                <Field>
                    <FieldLabel htmlFor="meetingPoint">Meeting Point *</FieldLabel>
                    <Textarea
                        id="meetingPoint"
                        name="meetingPoint"
                        placeholder="Exact location where participants should meet"
                        rows={2}
                        required
                    />
                    <InputFieldError field="meetingPoint" state={state} />
                </Field>

                {/* Itinerary (JSON) */}
                <Field>
                    <FieldLabel htmlFor="itinerary">Itinerary (JSON)</FieldLabel>
                    <Textarea
                        id="itinerary"
                        name="itinerary"
                        placeholder='[{"day": 1, "activities": ["Activity 1", "Activity 2"]}]'
                        rows={4}
                    />
                    <FieldDescription>Enter itinerary as JSON array</FieldDescription>
                </Field>

                {/* Image Upload */}
                <Field>
                    <FieldLabel htmlFor="images">Tour Images</FieldLabel>
                    <Input
                        id="images"
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                    />
                    <FieldDescription>Upload multiple images for the tour</FieldDescription>
                    {images.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm font-medium mb-2">Selected images:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <div className="border rounded p-2 text-sm truncate">
                                            {image.name}
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                            onClick={() => removeImage(index)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Field>

                {/* Checkboxes */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isActive" name="isActive" defaultChecked value="true" />
                        <Label htmlFor="isActive">Active Tour</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isFeatured" name="isFeatured" value="true" />
                        <Label htmlFor="isFeatured">Featured Tour</Label>
                    </div>
                </div>
            </FieldGroup>

            {/* Submit Button */}
            <Field>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creating Tour..." : "Create Tour"}
                </Button>
            </Field>
        </form>
    );
}