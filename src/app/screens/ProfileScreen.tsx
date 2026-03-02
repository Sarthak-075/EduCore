import React from "react";
import { Moon, Sun, LogOut, User, Mail, Phone, X } from "lucide-react";
import { MobileContainer } from "../components/MobileContainer";
import { BottomNav } from "../components/BottomNav";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { GradientButton } from "../components/GradientButton";
import { Input } from "../components/ui/input";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router";
import { formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../utils/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "../api/auth";

export function ProfileScreen() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, signOut, refetch } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  // keep edit form synced with user when modal opens
  React.useEffect(() => {
    if (showEditModal && user) {
      setEditData({ name: user.name, phone: user.phone || "" });
    }
  }, [showEditModal, user]);
  const [isSaving, setIsSaving] = useState(false);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const handleEditProfile = async () => {
    if (!editData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ name: editData.name, phone: editData.phone }).unwrap();
      toast.success("Profile updated successfully");
      setShowEditModal(false);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <MobileContainer withBottomNav>
      <div className="h-screen overflow-y-auto pb-20">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* User Info Card */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                {user?.name?.[0] ?? "T"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold truncate">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">Tuition Teacher</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{formatPhoneNumber(user?.phone || '')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Settings</h3>

            {/* Dark Mode Toggle */}
            <div className="bg-card rounded-xl p-5 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="cursor-pointer">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            {/* Edit Profile */}
            <button 
              onClick={() => setShowEditModal(true)}
              className="w-full bg-card rounded-xl p-5 border border-border flex items-center gap-3 hover:border-blue-500 transition-colors text-left"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Edit Profile</p>
                <p className="text-xs text-muted-foreground">Update your personal information</p>
              </div>
            </button>
          </div>

          {/* Logout Button */}
          <div className="pt-6">
            <GradientButton
              variant="secondary"
              onClick={handleLogout}
              className="w-full h-12 border-destructive/20 text-destructive hover:bg-destructive/10 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>Logout</span>
            </GradientButton>
          </div>

          {/* App Info */}
          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">EduCore v1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">© 2026 All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-card w-full rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  placeholder="Email"
                  className="h-12 rounded-xl bg-input-background border-transparent opacity-60"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="h-12 rounded-xl bg-input-background border-transparent focus:border-blue-500"
                />
              </div>

              <div className="pt-4">
                <GradientButton
                  onClick={handleEditProfile}
                  disabled={isSaving}
                  className="w-full h-12"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </MobileContainer>
  );
}