"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/ProfileCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AddProfileForm } from "@/components/AddProfileForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { getProfiles, getUserProfiles } from "@/lib/firestore";
import { Profile } from "@/types";
import { Search, Info } from "lucide-react";

function HomeContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, signIn, signOut } = useAuth();

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const profilesData = await getProfiles(selectedCategory);
      setProfiles(profilesData);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const userProfiles = await getUserProfiles(user.uid);
      if (userProfiles.length > 0) {
        setUserProfile(userProfiles[0]); // Get the first profile
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Filter profiles based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = profiles.filter(
        (profile) =>
          profile.username.toLowerCase().includes(query) ||
          profile.xHandle.toLowerCase().includes(query) ||
          profile.category.toLowerCase().includes(query) ||
          (profile.bio && profile.bio.toLowerCase().includes(query)) ||
          (profile.location && profile.location.toLowerCase().includes(query))
      );
      setFilteredProfiles(filtered);
    }
  }, [profiles, searchQuery]);

  useEffect(() => {
    fetchProfiles();
  }, [selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [user]);

  const handleProfileAdded = () => {
    fetchProfiles();
    fetchUserProfile();
  };

  const handleManageProfile = () => {
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">XList</h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <div className="relative group">
                <a
                  href="https://x.com/shipmodeon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="w-4 h-4" />
                </a>
                <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  any queries?
                </div>
              </div>
              {user ? (
                <>
                  <Button
                    onClick={handleManageProfile}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    {userProfile ? "Manage Profile" : "Add Profile"}
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                      {user.displayName}
                    </span>
                    <Button
                      variant="outline"
                      onClick={signOut}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  onClick={signIn}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Discover and Connect with X Users
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find interesting people to follow on X (Twitter) by category. Browse through our curated directory of profiles from various niches.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto -mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search profiles by name, handle, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full border-2 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-1">
        {/* Category Filter */}
        <div className="mb-1 sm:mb-2">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Add Profile Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <AddProfileForm
              onProfileAdded={handleProfileAdded}
              onClose={() => setShowAddForm(false)}
              existingProfile={userProfile || undefined}
            />
          </div>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading profiles...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery.trim()
                  ? "No profiles found matching your search."
                  : selectedCategory === "All"
                  ? "No profiles yet. Be the first to add one!"
                  : `No profiles in ${selectedCategory} category yet.`
                }
              </p>
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
