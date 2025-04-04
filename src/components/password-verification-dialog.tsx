import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export interface PasswordVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  action: string;
  confirmText?: string;
  confirmTextDisplay?: string;
  simple?: boolean;
}

const PasswordVerificationDialog = ({
  open,
  onOpenChange,
  onVerified,
  action,
  confirmText,
  confirmTextDisplay,
  simple = false,
}: PasswordVerificationDialogProps) => {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userConfirmText, setUserConfirmText] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleVerify = async () => {
    if (simple) {
      if (!isConfirmed) {
        toast.error("Please confirm the action");
        return;
      }
      onVerified();
      handleClose();
      return;
    }

    if (
      userConfirmText.trim().toLowerCase() !== confirmText?.trim().toLowerCase()
    ) {
      toast.error(`Please type the exact confirmation text`);
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user.email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified();
        handleClose();
      } else {
        toast.error("Incorrect password");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to verify password");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setUserConfirmText("");
    setShowPassword(false);
    setIsConfirmed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-800">
            {simple ? "Confirm Action" : "Password Verification"}
          </DialogTitle>
          <DialogDescription className="mt-2">
            {simple 
              ? `Are you sure you want to ${action}?`
              : `Please enter your password to ${action}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {simple ? (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm"
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                className="h-5 w-5"
              />
              <label
                htmlFor="confirm"
                className="text-sm font-medium text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand this action
              </label>
            </div>
          ) : (
            <>
              {confirmText && (
                <div className="space-y-2">
                  <label
                    htmlFor="confirmText"
                    className="text-sm font-medium text-gray-700"
                  >
                    Type &quot;{confirmTextDisplay || confirmText}&quot; to confirm:
                  </label>
                  <Input
                    id="confirmText"
                    value={userConfirmText}
                    onChange={(e) => setUserConfirmText(e.target.value)}
                    placeholder={confirmTextDisplay || confirmText}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Enter Your Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            className="w-full sm:w-auto"
            variant="default"
            disabled={
                isVerifying ||
                (simple ? !isConfirmed : (!Boolean(password) || (Boolean(confirmText) && userConfirmText !== confirmText)))
              }              
              
          >
            {isVerifying ? "Verifying..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordVerificationDialog;