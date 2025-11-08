"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AnalyticsData } from "@/types";
import { getAnalyticsData } from "@/lib/firestore";
import { TrendingUp, Users, Calendar, MousePointer } from "lucide-react";

interface AnalyticsProps {
  profileId: string;
  onClose: () => void;
}

export function Analytics({ profileId, onClose }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const data = await getAnalyticsData(profileId);
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [profileId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-red-500">{error || "No analytics data available"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Profile Analytics</CardTitle>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{analyticsData.totalClicks}</p>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{analyticsData.todayClicks}</p>
                    <p className="text-sm text-muted-foreground">Today's Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{analyticsData.weeklyClicks}</p>
                    <p className="text-sm text-muted-foreground">Weekly Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{analyticsData.monthlyClicks}</p>
                    <p className="text-sm text-muted-foreground">Monthly Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Clicks Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Clicks (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.dailyClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    interval={Math.floor(analyticsData.dailyClicks.length / 6)}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => formatDate(value as string)}
                    formatter={(value) => [`${value} clicks`, "Clicks"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    labelStyle={{
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>


        </CardContent>
      </Card>
    </div>
  );
}