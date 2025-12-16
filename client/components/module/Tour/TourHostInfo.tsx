import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  CheckCircle, 
  Award, 
  Calendar,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Host {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  phone?: string;
  bio?: string;
  hometown?: string;
  isVerified?: boolean;
  experience?: number;
}

interface TourHostInfoProps {
  host: Host;
}

export default function TourHostInfo({ host }: TourHostInfoProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Meet Your Host
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get to know the expert who will guide your tour
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Host Profile */}
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="relative mb-4">
              {host.profilePhoto ? (
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={host.profilePhoto}
                    alt={host.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-4xl font-bold text-primary">
                    {getInitials(host.name)}
                  </span>
                </div>
              )}
              
              {/* Verified Badge */}
              {host.isVerified && (
                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md">
                  <Badge className="bg-green-500 hover:bg-green-600 gap-1">
                    <CheckCircle className="h-3 w-3 fill-white" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-center">{host.name}</h3>
            
            {host.experience && (
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{host.experience}+ years experience</span>
              </div>
            )}

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-amber-400 fill-amber-400" 
                  />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5</span>
              <span className="text-xs text-muted-foreground">(127 reviews)</span>
            </div>
          </div>

          {/* Host Details */}
          <div className="md:w-2/3 space-y-4">
            {/* Bio */}
            {host.bio && (
              <div>
                <h4 className="font-semibold mb-2">About {host.name.split(' ')[0]}</h4>
                <p className="text-gray-700">{host.bio}</p>
              </div>
            )}

            {/* Contact & Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {host.email && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{host.email}</p>
                  </div>
                </div>
              )}

              {host.phone && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{host.phone}</p>
                  </div>
                </div>
              )}

              {host.hometown && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Hometown</p>
                    <p className="text-sm font-medium">{host.hometown}</p>
                  </div>
                </div>
              )}

              {/* Languages */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Languages</p>
                  <p className="text-sm font-medium">English, Spanish</p>
                </div>
              </div>
            </div>

            {/* Host Stats */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">Host Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">127</div>
                  <p className="text-xs text-muted-foreground">Tours Hosted</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,250+</div>
                  <p className="text-xs text-muted-foreground">Happy Travelers</p>
                </div>
              </div>
            </div>

            {/* Host Specialties */}
            <div>
              <h4 className="font-semibold mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  Local Culture
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  Photography
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  History
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  Adventure
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  Food Tours
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" asChild>
                <Link href={`mailto:${host.email}`}>
                  <Mail className="h-4 w-4" />
                  Contact Host
                </Link>
              </Button>
              
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                View All Tours
              </Button>
              
              <Button variant="outline" className="gap-2">
                <Star className="h-4 w-4" />
                Read Reviews
              </Button>
            </div>
          </div>
        </div>

        {/* Why Book With This Host */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-semibold text-primary mb-2">Why Book With This Host?</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Local expert with in-depth knowledge</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Personalized attention and small groups</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Flexible and customizable experiences</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>24/7 support during your tour</span>
            </li>
          </ul>
        </div>

        {/* Safety Information */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border">
          <h4 className="font-medium text-sm mb-2">Safety & Professionalism</h4>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Background verified</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>First aid certified</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Licensed guide</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Insurance covered</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}