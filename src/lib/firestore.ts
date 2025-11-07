import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile } from "@/types";

const PROFILES_COLLECTION = "profiles";

export async function addProfile(profile: Omit<Profile, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, PROFILES_COLLECTION), {
      ...profile,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding profile:", error);
    throw error;
  }
}

export async function getProfiles(category?: string) {
  try {
    let profilesQuery;
    
    if (category && category !== "All") {
      // First filter by category, then sort client-side to avoid index requirement
      profilesQuery = query(
        collection(db, PROFILES_COLLECTION),
        where("category", "==", category)
      );
    } else {
      profilesQuery = query(
        collection(db, PROFILES_COLLECTION)
      );
    }

    const querySnapshot = await getDocs(profilesQuery);
    const profiles: Profile[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Profile[];

    // Sort by followers count (high to low), then by createdAt for profiles with same followers
    return profiles.sort((a, b) => {
      // First sort by followers count (descending)
      const followersA = a.followersCount || 0;
      const followersB = b.followersCount || 0;
      
      if (followersB !== followersA) {
        return followersB - followersA;
      }
      
      // If followers count is same, sort by creation date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  } catch (error) {
    console.error("Error getting profiles:", error);
    throw error;
  }
}

export async function getUserProfiles(userId: string) {
  try {
    const profilesQuery = query(
      collection(db, PROFILES_COLLECTION),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(profilesQuery);
    const profiles: Profile[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Profile[];

    // Sort by creation date (newest first) for user profiles
    return profiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error getting user profiles:", error);
    throw error;
  }
}

export async function updateProfile(profileId: string, profileData: Partial<Profile>) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, profileId);
    await updateDoc(profileRef, profileData);
    return profileId;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, profileId);
    await deleteDoc(profileRef);
    return profileId;
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
}