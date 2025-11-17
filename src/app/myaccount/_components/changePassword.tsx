import { useState, useEffect } from "react"
import { Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import { axiosInstance } from "@/configs/axios"

type ChangePasswordFormProps = {
  email: string;
}

export default function ChangePasswordForm({ email }: ChangePasswordFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`?gofor=loggedupdatepassword&email=${encodeURIComponent(email)}&oldpassword=${encodeURIComponent(formData.oldPassword)}&password=${encodeURIComponent(formData.newPassword)}&confirmpassword=${encodeURIComponent(formData.confirmPassword)}`);

      const data = response.data;

      if (data?.message === "Password Updated Successfully") {
        setShowSuccess(true);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data?.message || "Failed to change password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while updating the password.");
    } finally {
      setIsLoading(false);
    }
  };



  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  if (showSuccess) {
    return (
      <div className=" w-full p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Password Changed!</h2>
        <p className="text-sm text-muted-foreground">Your password has been changed successfully.</p>
      </div>
    )
  }

  return (
    <Card className="rounded-2xl bg-black w-full p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
      <div className="space-y-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center">Change Your Password</h1>
        <div className="space-y-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="space-y-4">
              {/* Old Password Field */}
              <div className="space-y-2">
                <Label htmlFor="old-password">Old Password</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showPasswords.old ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                    required
                    className="pr-10 bg-[#171717]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full  px-3 hover:bg-transparent text-white/70 hover:text-white"
                    onClick={() => togglePasswordVisibility("old")}
                  >
                    {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="pr-10 bg-[#171717]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/70 hover:text-white"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>

              {/* Confirm New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className="pr-10 bg-[#171717]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/70 hover:text-white"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Changing password..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  )
}
