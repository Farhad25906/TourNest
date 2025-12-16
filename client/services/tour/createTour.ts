
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createTourValidationSchema } from "@/zod/tour.validation";


export const createTour = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        // Extract and transform form data
        const rawData = {
            title: formData.get('title'),
            description: formData.get('description'),
            destination: formData.get('destination'),
            city: formData.get('city'),
            country: formData.get('country'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            duration: parseInt(formData.get('duration') as string) || 0,
            price: parseFloat(formData.get('price') as string) || 0,
            maxGroupSize: parseInt(formData.get('maxGroupSize') as string) || 0,
            category: formData.get('category'),
            difficulty: formData.get('difficulty'),
            included: formData.getAll('included') || [],
            excluded: formData.getAll('excluded') || [],
            meetingPoint: formData.get('meetingPoint'),
            isActive: formData.get('isActive') === 'true',
            isFeatured: formData.get('isFeatured') === 'true',
        };

        // Handle itinerary (JSON string)
        const itinerary = formData.get('itinerary');
        if (itinerary) {
            try {
                rawData.itinerary = JSON.parse(itinerary as string);
            } catch {
                rawData.itinerary = itinerary;
            }
        }

        // Validate data
        const validation = zodValidator(rawData, createTourValidationSchema);
        if (!validation.success) {
            return validation;
        }

        const validatedData = validation.data;

        // Prepare form data for upload
        const submitData = new FormData();
        submitData.append("data", JSON.stringify({
            ...validatedData,
            currentGroupSize: 0,
            views: 0
        }));

        // Handle multiple image uploads
        const images = formData.getAll('images');
        images.forEach((image, index) => {
            if (image instanceof File && image.size > 0) {
                submitData.append(`images`, image);
            }
        });

        // Make API call
        const res = await serverFetch.post("/tour/create-tour", {
            body: submitData,
        });
        console.log(res);
        

        const result = await res.json();

        if (result.success) {
            return {
                success: true,
                message: "Tour created successfully!",
                data: result.data
            };
        }

        return result;

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Tour creation error:", error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : "Failed to create tour. Please try again."}`
        };
    }
};