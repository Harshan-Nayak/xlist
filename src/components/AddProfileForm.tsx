"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { addProfile, updateProfile, getUserProfiles } from "@/lib/firestore";
import { CATEGORIES, Profile } from "@/types";

interface AddProfileFormProps {
  onProfileAdded: () => void;
  onClose: () => void;
  existingProfile?: Profile;
}

export function AddProfileForm({ onProfileAdded, onClose, existingProfile }: AddProfileFormProps) {
  const [xHandle, setXHandle] = useState("");
  const [username, setUsername] = useState("");
  const [category, setCategory] = useState(existingProfile?.category || "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [followersCount, setFollowersCount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (existingProfile) {
      setXHandle(existingProfile.xHandle);
      setUsername(existingProfile.username);
      setCategory(existingProfile.category);
      setBio(existingProfile.bio || "");
      setLocation(existingProfile.location || "");
      setWebsite(existingProfile.website || "");
      setFollowersCount(existingProfile.followersCount?.toString() || "");
    } else {
      // Reset form when no existing profile
      setXHandle("");
      setUsername("");
      setCategory("");
      setBio("");
      setLocation("");
      setWebsite("");
      setFollowersCount("");
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please sign in to add a profile");
      return;
    }

    if (!xHandle || !username || !category) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const profileData: any = {
        xHandle: xHandle.startsWith("@") ? xHandle : `@${xHandle}`,
        username,
        category,
        userId: user.uid,
      };

      // Only include optional fields if they have values
      if (bio.trim()) profileData.bio = bio.trim();
      if (location.trim()) profileData.location = location.trim();
      if (website.trim()) profileData.website = website.trim();
      if (followersCount.trim()) profileData.followersCount = parseInt(followersCount);

      if (existingProfile) {
        await updateProfile(existingProfile.id, profileData);
      } else {
        await addProfile(profileData);
      }

      // Reset form
      setXHandle("");
      setUsername("");
      setCategory("");
      setBio("");
      setLocation("");
      setWebsite("");
      setFollowersCount("");
      
      onProfileAdded();
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>{existingProfile ? "Edit Your Profile" : "Add Your Profile"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="xHandle">X Handle *</Label>
              <Input
                id="xHandle"
                type="text"
                placeholder="@username"
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                type="text"
                placeholder="Brief description about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="text"
                placeholder="https://yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followersCount">Followers Count</Label>
              <Input
                id="followersCount"
                type="number"
                placeholder="1000"
                value={followersCount}
                onChange={(e) => setFollowersCount(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (existingProfile ? "Updating..." : "Adding...") : (existingProfile ? "Update Profile" : "Add Profile")}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}