import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/actions/settings"
import { UserCircle, Shield, Key } from "lucide-react"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-2">Manage your personal profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Sidebar Info */}
        <div className="col-span-1 space-y-6">
          <Card className="border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircle size={48} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{user.email}</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                <Shield size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold tracking-wider text-slate-700 uppercase">{user.role}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Form Content */}
        <div className="col-span-2 space-y-6">
          <SettingsForm defaultName={user.name || ""} />
        </div>
      </div>
    </div>
  )
}
