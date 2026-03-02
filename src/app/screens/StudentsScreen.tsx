import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { StudentCard } from "../components/student/StudentCard";
import { Input } from "../components/ui/input";
import { Link } from "react-router";
import { cn } from "../components/ui/utils";
import { FILTER_OPTIONS, FilterType } from "../constants/filters";
import { useGetStudentsQuery } from "../api/students";

export function StudentsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: students = [], isLoading } = useGetStudentsQuery();

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.parentName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || student.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <MobileContainer withBottomNav>
      <div className="h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold mb-4">Students</h1>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeFilter === filter.value
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                    : "bg-accent text-foreground hover:bg-accent/80"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className="px-6 py-4">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-4">
                <Filter className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                {searchQuery ? "Try adjusting your search" : "Add your first student to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        to="/students/add"
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow z-20"
      >
        <Plus className="w-6 h-6 text-white" />
      </Link>

      <BottomNav />
    </MobileContainer>
  );
}