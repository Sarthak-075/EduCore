import { useState } from "react";
import React from "react";
import { Bell, ChevronDown, DollarSign, Users, AlertCircle } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { StatCard } from "../components/StatCard";
import { MonthlyProgressCard } from "../components/dashboard/MonthlyProgressCard";
import { StudentListItem } from "../components/student/StudentListItem";
import { ActivityCard } from "../components/activity/ActivityCard";
import { Link } from "react-router";
import { useGetDashboardQuery } from "../api/dashboard";
import { useGetStudentsQuery } from "../api/students";
import { useAuth } from "../utils/auth";
import { MonthlyProgress } from "../types";
import { formatCurrencyCompact } from "../utils/helpers";
import { RECENT_ACTIVITY } from "../constants/activity";

export function DashboardScreen() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { user } = useAuth();
  const { data: dashboardData } = useGetDashboardQuery({ month: selectedMonth, year: selectedYear });
  const { data: students = [] } = useGetStudentsQuery();

  // Compute monthly progress from dashboard data
  const monthlyProgress = dashboardData ? {
    collected: dashboardData.totalCollected,
    target: dashboardData.totalExpected,
    percentage: dashboardData.percentage,
  } : { collected: 0, target: 0, percentage: 0 };

  // Get students with pending or partial status
  const pendingStudents = students.filter(
    (s) => s.status === "pending" || s.status === "partial"
  ).slice(0, 5);

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <MobileContainer withBottomNav>
      <div className="h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.name.split(" ")[0] || 'Teacher'} 👋</h1>
              <p className="text-sm text-muted-foreground">Track your collections</p>
            </div>
            <button 
              onClick={() => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                alert(`No new notifications\n\nToday: ${today}`);
              }}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center relative hover:bg-accent/80 transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
          
          {/* Month/Year Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-sm hover:bg-accent/80 transition w-full justify-between"
            >
              <span>{monthName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>
            
            {showMonthPicker && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-lg p-4 shadow-lg z-30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Month</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    >
                      {months.map(m => (
                        <option key={m} value={m}>
                          {new Date(2024, m - 1).toLocaleString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Year</label>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMonthPicker(false)}
                  className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Monthly Progress Card */}
          <MonthlyProgressCard progress={monthlyProgress} />

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              title="Students"
              value={String(students.length)}
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              title="Expected"
              value={formatCurrencyCompact(dashboardData?.totalExpected || 0)}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <StatCard
              title="Pending"
              value={formatCurrencyCompact(dashboardData?.totalPending || 0)}
              icon={<AlertCircle className="w-4 h-4" />}
            />
          </div>

          {/* Pending Fees Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pending Fees</h2>
              <Link to="/students" className="text-sm text-blue-500 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {pendingStudents.map((student) => (
                <StudentListItem key={student.id} student={student} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}