"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, Sparkles, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    })
    if (res?.error) {
      setError("Invalid credentials")
      setIsLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden border border-white/50">
      
      {/* Left Column - Branding */}
      <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl mix-blend-overlay transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
            <GraduationCap className="text-white h-8 w-8" />
          </div>
          <span className="text-3xl font-extrabold text-white tracking-tight">EDU-LEAD</span>
        </div>

        <div className="relative z-10 mt-20">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Intelligent admission management, <br/> built for the future.
          </h2>
          <p className="text-blue-100 text-lg max-w-sm mb-8 leading-relaxed">
            Unify your team, track leads instantly, and boost conversion rates with real-time analytics.
          </p>
          <div className="flex items-center gap-3 text-blue-200 text-sm font-medium">
            <Sparkles size={16} /> Production-grade CRM System
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="p-10 sm:p-14 flex flex-col justify-center relative">
        <div className="absolute top-0 right-0 p-8">
           <Activity className="text-slate-200 w-24 h-24 absolute -top-4 -right-4 -rotate-12 blur-[2px]" />
        </div>

        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Welcome back</h3>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl font-medium animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="admin@edulead.com"
                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-xl"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-700 font-semibold text-xs uppercase tracking-wider">Password</Label>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot password?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="h-12 bg-white/50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all rounded-xl"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all duration-200 group flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-10 text-center text-sm text-slate-500">
            Need demo credentials? <br className="sm:hidden" />
            <span className="font-semibold text-slate-700">admin@edulead.com / password123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
