"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { updateTourValidationSchema } from "@/zod/tour.validation";

export const updateTour = async (tourId: string, formData: FormData): Promise<any> => {
    try {
        // Extract and transform form data
        const rawData: Record<string, any> = {};
        
        // Add optional fields only if they exist in formData
        const fields = [
            'title', 'description', 'destination', 'city', 'country',
            'startDate', 'endDate', 'duration', 'price', 'maxGroupSize',
            'category', 'difficulty', 'meetingPoint',
            'isActive', 'isFeatured'
        ];

        fields.forEach(field => {
            const value = formData.get(field);
            if (value !== null && value !== '') {
                if (field === 'duration' || field === 'maxGroupSize') {
                    rawData[field] = parseInt(value as string);
                } else if (field === 'price') {
                    rawData[field] = parseFloat(value as string);
                } else if (field === 'isActive' || field === 'isFeatured') {
                    rawData[field] = value === 'true';
                } else if (field === 'startDate' || field === 'endDate') {
                    rawData[field] = new Date(value as string).toISOString();
                } else {
                    rawData[field] = value;
                }
            }
        });

        // Handle included and excluded arrays
        const included = formData.getAll('included');
        if (included.length > 0) {
            rawData.included = included.filter(item => item !== '');
        }

        const excluded = formData.getAll('excluded');
        if (excluded.length > 0) {
            rawData.excluded = excluded.filter(item => item !== '');
        }

        // Handle itinerary (JSON string)
        const itinerary = formData.get('itinerary');
        if (itinerary) {
            try {
                rawData.itinerary = JSON.parse(itinerary as string);
            } catch {
                rawData.itinerary = itinerary;
            }
        }

        // Handle images array
        const imagesInput = formData.get('images');
        if (imagesInput) {
            try {
                rawData.images = JSON.parse(imagesInput as string);
            } catch {
                // If not JSON, it might be a string or array
                rawData.images = imagesInput;
            }
        }

        // Validate data if there's any data to validate
        if (Object.keys(rawData).length > 0) {
            const validation = zodValidator(rawData, updateTourValidationSchema);
            if (!validation.success) {
                return validation;
            }
        }

        // Prepare form data for upload
        const submitData = new FormData();
        
        // Only append data if there are fields to update
        if (Object.keys(rawData).length > 0) {
            submitData.append("data", JSON.stringify(rawData));
        }

        // Handle image uploads - only new images
        const newImages = formData.getAll('newImages');
        newImages.forEach((image, index) => {
            if (image instanceof File && image.size > 0) {
                submitData.append(`images`, image);
            }
        });

        // Make API call for update
        const res = await serverFetch.patch(`/tour/${tourId}`, {
            body: submitData,
        });

        const result = await res.json();

        if (result.success) {
            return {
                success: true,
                message: "Tour updated successfully!",
                data: result.data
            };
        }

        return result;

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Tour update error:", error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : "Failed to update tour. Please try again."}`
        };
    }
};