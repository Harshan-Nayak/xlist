import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, updateDoc, deleteDoc, startAfter, endBefore, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile, ProfileClick, AnalyticsData } from "@/types";

const PROFILES_COLLECTION = "profiles";
const CLICKS_COLLECTION = "profileClicks";

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

export async function trackProfileClick(profileId: string, userAgent?: string, ipAddress?: string) {
  try {
    const clickData: any = {
      profileId,
      clickedAt: Timestamp.now(),
    };
    
    // Only include userAgent if it's defined
    if (userAgent) {
      clickData.userAgent = userAgent;
    }
    
    // Only include ipAddress if it's defined
    if (ipAddress) {
      clickData.ipAddress = ipAddress;
    }
    
    const docRef = await addDoc(collection(db, CLICKS_COLLECTION), clickData);
    return docRef.id;
  } catch (error) {
    console.error("Error tracking profile click:", error);
    throw error;
  }
}

export async function getProfileClicks(profileId: string, startDate?: Date, endDate?: Date) {
  try {
    let clicksQuery;
    
    if (startDate && endDate) {
      clicksQuery = query(
        collection(db, CLICKS_COLLECTION),
        where("profileId", "==", profileId),
        where("clickedAt", ">=", Timestamp.fromDate(startDate)),
        where("clickedAt", "<=", Timestamp.fromDate(endDate)),
        orderBy("clickedAt", "desc")
      );
    } else {
      clicksQuery = query(
        collection(db, CLICKS_COLLECTION),
        where("profileId", "==", profileId),
        orderBy("clickedAt", "desc")
      );
    }

    const querySnapshot = await getDocs(clicksQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      profileId: doc.data().profileId,
      clickedAt: doc.data().clickedAt?.toDate() || new Date(),
      userAgent: doc.data().userAgent,
      ipAddress: doc.data().ipAddress,
    })) as ProfileClick[];
  } catch (error) {
    console.error("Error getting profile clicks:", error);
    throw error;
  }
}

export async function getAnalyticsData(profileId: string): Promise<AnalyticsData> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total clicks
    const totalClicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      where("profileId", "==", profileId)
    );
    const totalClicksSnapshot = await getDocs(totalClicksQuery);
    const totalClicks = totalClicksSnapshot.size;

    // Get today's clicks
    const todayClicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      where("profileId", "==", profileId),
      where("clickedAt", ">=", Timestamp.fromDate(today))
    );
    const todayClicksSnapshot = await getDocs(todayClicksQuery);
    const todayClicks = todayClicksSnapshot.size;

    // Get this month's clicks
    const monthlyClicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      where("profileId", "==", profileId),
      where("clickedAt", ">=", Timestamp.fromDate(thisMonth))
    );
    const monthlyClicksSnapshot = await getDocs(monthlyClicksQuery);
    const monthlyClicks = monthlyClicksSnapshot.size;

    // Get weekly clicks
    const weeklyClicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      where("profileId", "==", profileId),
      where("clickedAt", ">=", Timestamp.fromDate(lastWeek))
    );
    const weeklyClicksSnapshot = await getDocs(weeklyClicksQuery);
    const weeklyClicks = weeklyClicksSnapshot.size;

    // Get daily clicks for the last 30 days
    const dailyClicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      where("profileId", "==", profileId),
      where("clickedAt", ">=", Timestamp.fromDate(thirtyDaysAgo)),
      orderBy("clickedAt", "asc")
    );
    const dailyClicksSnapshot = await getDocs(dailyClicksQuery);
    
    // Group clicks by date
    const dailyClicksMap = new Map<string, number>();
    dailyClicksSnapshot.forEach((doc) => {
      const date = doc.data().clickedAt?.toDate();
      if (date) {
        const dateStr = date.toISOString().split('T')[0];
        dailyClicksMap.set(dateStr, (dailyClicksMap.get(dateStr) || 0) + 1);
      }
    });

    // Fill in missing dates with 0 clicks
    const dailyClicks = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyClicks.push({
        date: dateStr,
        clicks: dailyClicksMap.get(dateStr) || 0,
      });
    }

    return {
      totalClicks,
      dailyClicks,
      monthlyClicks,
      weeklyClicks,
      todayClicks,
    };
  } catch (error) {
    console.error("Error getting analytics data:", error);
    throw error;
  }
}