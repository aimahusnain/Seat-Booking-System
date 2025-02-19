"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getPasswordHashes } from "@/hooks/usePassword";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        toast.error("New passwords don't match");
        return;
      }

      const currentHash = await sha256(currentPassword);
      const storedHashes = await getPasswordHashes();

      if (!storedHashes.includes(currentHash)) {
        toast.error("Current password is incorrect");
        return;
      }

      const newPasswordHash = await sha256(newPassword);

      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPasswordHash,
          passwordId: "cm6qe7hna0000awj80t45jwfe",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password changed successfully");
        setIsOpen(false);
        resetForm();
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      toast.error("An error occurred while changing the password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Change Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <label htmlFor="current-password">Current Password</label>
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full"
              />
              <Button
                variant="ghost"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <div>
              <label htmlFor="new-password">New Password</label>
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
              />
              <Button
                variant="ghost"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <div>
              <label htmlFor="confirm-password">Confirm Password</label>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
              <Button
                variant="ghost"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="mt-4 w-full">
            Change Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
