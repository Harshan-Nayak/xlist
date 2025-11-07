export interface Profile {
  id: string;
  xHandle: string;
  username: string;
  category: string;
  bio?: string;
  location?: string;
  website?: string;
  followersCount?: number;
  profileImage?: string;
  userId: string;
  createdAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export const CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Business",
  "Content Creator",
  "Developer",
  "Entrepreneur",
  "Artist",
  "Writer",
  "Journalist",
  "Photographer",
  "Musician",
  "Gamer",
  "Sports",
  "Fashion",
  "Food",
  "Travel",
  "Fitness",
  "Education",
  "Science",
  "Healthcare",
  "Finance",
  "Real Estate",
  "Crypto",
  "AI",
  "Startup",
  "Consulting",
  "Legal",
  "Nonprofit",
  "Government",
  "Other"
] as const;