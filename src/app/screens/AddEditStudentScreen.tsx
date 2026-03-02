import { useState } from "react";
import React from "react";
import { ArrowLeft, User, Phone, DollarSign, Calendar } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { GradientButton } from "../components/GradientButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGetStudentsQuery, useAddStudentMutation, useUpdateStudentMutation } from "../api/students";

export function AddEditStudentScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: students = [] } = useGetStudentsQuery();

  const [formData, setFormData] = useState({
    studentName: "",
    parentName: "",
    parentPhone: "",
    monthlyFee: "",
    dueDay: "",
    isActive: true,
  });

  // when editing, prefill the form once students are loaded
  React.useEffect(() => {
    if (isEdit && id && students.length) {
      const s = students.find((s) => s.id === id);
      if (s) {
        setFormData({
          studentName: s.name,
          parentName: s.parentName || "",
          parentPhone: s.parentPhone || "",
          monthlyFee: String(s.monthlyFee),
          dueDay: String(s.dueDay),
          isActive: s.isActive || false,
        });
      }
    }
  }, [isEdit, id, students]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [addStudent] = useAddStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.studentName) newErrors.studentName = "Student name is required";
    if (!formData.parentName) newErrors.parentName = "Parent name is required";
    if (!formData.parentPhone) newErrors.parentPhone = "Phone number is required";
    if (!formData.monthlyFee) newErrors.monthlyFee = "Monthly fee is required";
    if (!formData.dueDay) newErrors.dueDay = "Due day is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        if (isEdit && id) {
          await updateStudent({ id, changes: {
            name: formData.studentName,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            monthlyFee: parseFloat(formData.monthlyFee),
            dueDay: parseInt(formData.dueDay, 10),
            isActive: formData.isActive,
          } }).unwrap();
          toast.success("Student updated successfully");
        } else {
          await addStudent({
            name: formData.studentName,
            parentName: formData.parentName,
            parentPhone: formData.parentPhone,
            monthlyFee: parseFloat(formData.monthlyFee),
            dueDay: parseInt(formData.dueDay, 10),
            isActive: formData.isActive,
          }).unwrap();
          toast.success("Student added successfully");
        }
        navigate("/students");
      } catch (err) {
        toast.error("Failed to save student");
      }
    }
  };

  const isFormValid = formData.studentName && formData.parentName && 
    formData.parentPhone && formData.monthlyFee && formData.dueDay;

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Student" : "Add Student"}</h1>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Student Name */}
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter student name"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>
              {errors.studentName && <p className="text-xs text-destructive">{errors.studentName}</p>}
            </div>

            {/* Parent Name */}
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="parentName"
                  type="text"
                  placeholder="Enter parent name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>
              {errors.parentName && <p className="text-xs text-destructive">{errors.parentName}</p>}
            </div>

            {/* Parent Phone */}
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="03001234567"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>
              {errors.parentPhone && <p className="text-xs text-destructive">{errors.parentPhone}</p>}
            </div>

            {/* Monthly Fee */}
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Monthly Fee (₹) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="monthlyFee"
                  type="number"
                  placeholder="5000"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                  className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>
              {errors.monthlyFee && <p className="text-xs text-destructive">{errors.monthlyFee}</p>}
            </div>

            {/* Due Day */}
            <div className="space-y-2">
              <Label htmlFor="dueDay">Due Day of Month *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="5"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  className="pl-10 h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>
              {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay}</p>}
              <p className="text-xs text-muted-foreground">Fee due date each month (1-31)</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div>
                <Label htmlFor="isActive">Active Student</Label>
                <p className="text-xs text-muted-foreground mt-1">Student is currently enrolled</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </form>
        </div>

        {/* Sticky Bottom Button */}
        <div className="border-t border-border bg-card px-6 py-4">
          <GradientButton
            onClick={handleSubmit}
            className="w-full h-12"
            disabled={!isFormValid}
          >
            {isEdit ? "Update Student" : "Save Student"}
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
