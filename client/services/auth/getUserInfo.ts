/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { UserInfo } from "@/types/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandlers";

export const getUserInfo = async (): Promise<UserInfo | any> => {
    try {
        // Fetch user info from /users/me endpoint
        const response = await serverFetch.get("/users/me", {
            next: { tags: ["user-info"], revalidate: 180 },
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Failed to fetch user info");
        }

        // Get token for additional info
        const accessToken = await getCookie("accessToken");
        
        let tokenInfo = {};
        if (accessToken) {
            try {
                const verifiedToken = jwt.verify(accessToken, process.env.JWT_SECRET as string) as JwtPayload;
                tokenInfo = {
                    name: verifiedToken.name,
                    email: verifiedToken.email,
                    role: verifiedToken.role,
                };
            } catch (tokenError) {
                console.log("Token verification error:", tokenError);
                // Continue without token info
            }
        }

        // Format user info based on role
        const userData = result.data;
        let userInfo: UserInfo;

        // Determine user role and extract appropriate data
        const role = userData.role || (tokenInfo as any).role;
        
        switch (role) {
            case "ADMIN":
                userInfo = {
                    id: userData.id,
                    name: userData.admin?.name || userData.name || (tokenInfo as any).name || "Unknown Admin",
                    email: userData.email || (tokenInfo as any).email,
                    role: "ADMIN",
                    admin: userData.admin || {
                        name: userData.name,
                        email: userData.email,
                        contactNumber: userData.contactNumber,
                        profilePhoto: userData.profilePhoto,
                    }
                };
                break;

            case "HOST":
                userInfo = {
                    id: userData.id,
                    name: userData.host?.name || userData.name || (tokenInfo as any).name || "Unknown Host",
                    email: userData.email || (tokenInfo as any).email,
                    role: "HOST",
                    host: userData.host || {
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        bio: userData.bio,
                        hometown: userData.hometown,
                        profilePhoto: userData.profilePhoto,
                        isVerified: userData.isVerified,
                        tourLimit: userData.tourLimit,
                        currentTourCount: userData.currentTourCount,
                    }
                };
                break;

            case "TOURIST":
            case "USER": // Handle both USER and TOURIST roles
                userInfo = {
                    id: userData.id,
                    name: userData.tourist?.name || userData.name || (tokenInfo as any).name || "Unknown Tourist",
                    email: userData.email || (tokenInfo as any).email,
                    role: role === "USER" ? "USER" : "TOURIST",
                    user: userData.tourist || userData.user || {
                        name: userData.name,
                        email: userData.email,
                        profilePhoto: userData.profilePhoto,
                        phone: userData.phone,
                        bio: userData.bio,
                        location: userData.location,
                        interests: userData.interests,
                        visitedCountries: userData.visitedCountries,
                    }
                };
                break;

            default:
                // Default fallback
                userInfo = {
                    id: userData.id || "",
                    name: userData.name || (tokenInfo as any).name || "Unknown User",
                    email: userData.email || (tokenInfo as any).email || "",
                    role: role || "USER",
                    ...userData
                };
                break;
        }

        return userInfo;
    } catch (error: any) {
        console.error("Get user info error:", error);
        
        // Return minimal user info on error
        return {
            id: "",
            name: "Unknown User",
            email: "",
            role: "USER",
        };
    }
};