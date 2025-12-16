"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface DayActivity {
  time?: string;
  activity: string;
  description?: string;
  location?: string;
}

interface ItineraryDay {
  day: number;
  title?: string;
  description?: string;
  activities: DayActivity[];
  accommodation?: string;
  meals?: string;
}

interface TourItineraryProps {
  itinerary: any; // Can be string, array, or object
}

export default function TourItinerary({ itinerary }: TourItineraryProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([]);

  // Parse itinerary data - handle different formats
  const parseItinerary = (): ItineraryDay[] => {
    if (!itinerary) return [];

    try {
      // If it's a string, try to parse it
      if (typeof itinerary === 'string') {
        const parsed = JSON.parse(itinerary);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // If it's already an array
      if (Array.isArray(itinerary)) {
        return itinerary;
      }
      
      // If it's an object with days property
      if (itinerary.days && Array.isArray(itinerary.days)) {
        return itinerary.days;
      }
      
      return [];
    } catch (error) {
      console.error("Error parsing itinerary:", error);
      return [];
    }
  };

  const itineraryDays = parseItinerary();
  
  if (itineraryDays.length === 0) {
    return null;
  }

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(d => d !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const isDayExpanded = (dayNumber: number) => {
    return expandedDays.includes(dayNumber);
  };

  const formatDayTitle = (day: ItineraryDay) => {
    if (day.title) {
      return `Day ${day.day}: ${day.title}`;
    }
    return `Day ${day.day}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tour Itinerary
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Detailed day-by-day breakdown of your tour activities
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {itineraryDays.map((day) => (
            <div key={day.day} className="border rounded-lg overflow-hidden">
              {/* Day Header */}
              <div 
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                onClick={() => toggleDay(day.day)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <Badge className="w-10 h-10 flex items-center justify-center text-lg">
                      {day.day}
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-1">DAY</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{formatDayTitle(day)}</h3>
                    {day.description && !isDayExpanded(day.day) && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {day.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isDayExpanded(day.day) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Day Content (Expandable) */}
              {isDayExpanded(day.day) && (
                <div className="p-4 space-y-4">
                  {day.description && (
                    <>
                      <p className="text-gray-700">{day.description}</p>
                      <Separator className="my-3" />
                    </>
                  )}

                  {/* Activities List */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Activities
                    </h4>
                    <div className="space-y-3">
                      {day.activities.map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex gap-3 p-3 bg-white border rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            {index < day.activities.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium">{activity.activity}</h4>
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              {activity.time && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground whitespace-nowrap">
                                  <Clock className="h-3 w-3" />
                                  {activity.time}
                                </div>
                              )}
                            </div>
                            
                            {activity.location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                <MapPin className="h-3 w-3" />
                                {activity.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accommodation/Meals info if available */}
                  {(day.accommodation || day.meals) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {day.accommodation && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm text-blue-800 mb-1">
                              Accommodation
                            </h4>
                            <p className="text-sm text-blue-700">
                              {day.accommodation}
                            </p>
                          </div>
                        )}
                        {day.meals && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-sm text-green-800 mb-1">
                              Meals Included
                            </h4>
                            <p className="text-sm text-green-700">
                              {day.meals}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Itinerary Notes */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
          <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
            <li>Itinerary is subject to change based on weather conditions</li>
            <li>Activity times are approximate and may vary</li>
            <li>Please arrive at meeting points 15 minutes before scheduled time</li>
            <li>Notify your guide of any dietary restrictions in advance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}