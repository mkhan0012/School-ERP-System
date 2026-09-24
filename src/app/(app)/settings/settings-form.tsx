"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/actions/settings"
import { CheckCircle2, User, KeyRound } from "lucide-react"

export function SettingsForm({ defaultName }: { defaultName: string }) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    await updateProfile(formData)
    
    setIsSaving(false)
    setSuccess(true)
    
    // Clear password field after save
    const form = e.target as HTMLFormElement;
    (form.elements.namedItem("newPassword") as HTMLInputElement).value = "";
    
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-800">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-600 flex items-center gap-2">
                <User size={16} /> Full Name
              </Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={defaultName} 
                required 
                className="max-w-md bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-600 flex items-center gap-2">
                <KeyRound size={16} /> New Password (Optional)
              </Label>
              <Input 
                id="newPassword" 
                name="newPassword" 
                type="password" 
                placeholder="Leave blank to keep current password"
                className="max-w-md bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            
            {success && (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-in fade-in zoom-in">
                <CheckCircle2 size={16} /> Profile updated successfully
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
