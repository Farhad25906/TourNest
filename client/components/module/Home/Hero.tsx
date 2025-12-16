import { Compass, MapPin, Star, Calendar, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Hero() {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-blue-50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="w-full px-4 py-16 md:px-8 lg:px-16 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* Left Column - Hero Content */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start">
                <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg">
                  <Compass className="w-4 h-4" />
                  <span className="text-sm font-semibold">Explore the World</span>
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-3">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Your Journey
                </h1>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-blue-600 leading-tight">
                  Starts Here
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                Discover breathtaking destinations, immersive experiences, and unforgettable adventures tailored just for you. Let us turn your travel dreams into reality.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <Compass className="w-5 h-5 mr-2" />
                  Explore Destinations
                </Button>
                <Button
                  variant="outline"
                  className="h-14 px-8 text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Plan Your Trip
                </Button>
              </div>

             
            </div>

            {/* Right Column - Search Card */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-blue-100">
                
                {/* Card Header */}
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Trip</h2>
                  <p className="text-sm text-gray-600 mt-2">Tell us where you want to go</p>
                </div>

                {/* Form */}
                <form className="space-y-5">
                  
                  {/* Destination Input */}
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="Where would you like to go?"
                      className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Travel Style Select */}
                  <div className="space-y-2">
                    <Label htmlFor="travelStyle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      Travel Style
                    </Label>
                    <Select defaultValue="adventure">
                      <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select your style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adventure">Adventure & Exploration</SelectItem>
                        <SelectItem value="beach">Beach & Relaxation</SelectItem>
                        <SelectItem value="cultural">Cultural & Historical</SelectItem>
                        <SelectItem value="nature">Nature & Wildlife</SelectItem>
                        <SelectItem value="luxury">Luxury Experience</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-2">
                    <Label htmlFor="travelDate" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      When do you want to travel?
                    </Label>
                    <Input
                      id="travelDate"
                      name="travelDate"
                      type="date"
                      className="h-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Compass className="w-5 h-5 mr-2" />
                    Search Tours
                  </Button>
                </form>

                
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-10">
        <Compass className="w-32 h-32 text-blue-600" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-10">
        <MapPin className="w-24 h-24 text-blue-600" />
      </div>
    </div>
  );
}