"use client"
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarCheck, BookOpen, BarChart3, Settings, LogOut, UserCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function Sidebar({ role }: { role: string }) {
  const isPrivileged = role === 'ADMIN' || role === 'MANAGER';
  
  return (
    <div className="w-64 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl h-screen flex flex-col fixed shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 tracking-tight">EDU-LEAD</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
          <LayoutDashboard size={20} className="text-slate-500" /> Dashboard
        </Link>
        <Link href="/leads" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
          <Users size={20} className="text-slate-500" /> Leads
        </Link>
        <Link href="/follow-ups" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
          <CalendarCheck size={20} className="text-slate-500" /> Follow-ups
        </Link>
        
        {isPrivileged && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3">Management</p>
            </div>
            <Link href="/counsellors" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
              <UserCircle size={20} className="text-slate-500" /> Counsellors
            </Link>
            <Link href="/courses" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
              <BookOpen size={20} className="text-slate-500" /> Courses
            </Link>
            <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all font-medium">
              <BarChart3 size={20} className="text-slate-500" /> Reports
            </Link>
          </>
        )}
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Settings size={20} /> Settings
        </Link>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  )
}
