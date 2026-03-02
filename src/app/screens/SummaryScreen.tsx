import { useState } from "react";
import { ChevronDown, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { StatCard } from "../components/StatCard";
import { StudentListItem } from "../components/student/StudentListItem";
import { MonthlySummary } from "../types";
import { formatCurrency, calculatePercentage } from "../utils/helpers";
import { useGetStudentsQuery } from "../api/students";
import { useGetDashboardQuery } from "../api/dashboard";

export function SummaryScreen() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { data: students = [] } = useGetStudentsQuery();
  const { data: dashboardData } = useGetDashboardQuery({ month: selectedMonth, year: selectedYear });

  const summary: MonthlySummary = dashboardData ? {
    totalExpected: dashboardData.totalExpected,
    totalCollected: dashboardData.totalCollected,
    totalPending: dashboardData.totalPending,
  } : {
    totalExpected: 0,
    totalCollected: 0,
    totalPending: 0,
  };

  const collectionRate = calculatePercentage(
    summary.totalCollected,
    summary.totalExpected
  );

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <MobileContainer withBottomNav>
      <div className="h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-20">
          <h1 className="text-2xl font-bold mb-4">Monthly Summary</h1>
          
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
          {/* Large Stat Cards */}
          <div className="space-y-4">
            <StatCard
              title="Total Expected"
              value={formatCurrency(summary.totalExpected)}
              icon={<DollarSign className="w-5 h-5" />}
              className="p-6"
            />
            <StatCard
              title="Total Collected"
              value={formatCurrency(summary.totalCollected)}
              icon={<TrendingUp className="w-5 h-5" />}
              gradient
              className="p-6"
            />
            <StatCard
              title="Total Pending"
              value={formatCurrency(summary.totalPending)}
              icon={<AlertCircle className="w-5 h-5" />}
              className="p-6"
            />
          </div>

          {/* Collection Rate */}
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-semibold">{collectionRate}%</p>
            </div>
            <div className="w-full h-3 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
          </div>

          {/* Students List */}
          <div>
            <h3 className="font-semibold text-lg mb-4">All Students</h3>
            <div className="space-y-3">
              {students.map((student) => (
                <StudentListItem key={student.id} student={student} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}