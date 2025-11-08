import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, Globe, Users } from "lucide-react";
import { Profile } from "@/types";
import { trackProfileClick } from "@/lib/firestore";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const openXProfile = async () => {
    try {
      // Track the click before opening the profile
      await trackProfileClick(profile.id, navigator.userAgent);
      
      const cleanHandle = profile.xHandle.replace("@", "").replace("https://x.com/", "");
      window.open(`https://x.com/${cleanHandle}`, "_blank");
    } catch (error) {
      console.error("Error tracking profile click:", error);
      // Still open the profile even if tracking fails
      const cleanHandle = profile.xHandle.replace("@", "").replace("https://x.com/", "");
      window.open(`https://x.com/${cleanHandle}`, "_blank");
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 h-full"
      onClick={openXProfile}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{profile.username}</h3>
              <p className="text-sm text-muted-foreground truncate">{profile.xHandle}</p>
              {profile.followersCount && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  {profile.followersCount.toLocaleString()} followers
                </div>
              )}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 mt-1" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {profile.bio && (
          <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">{profile.bio}</p>
        )}
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {profile.category}
          </Badge>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {profile.location && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}