import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Users, Flame, UserPlus, BookOpen, Activity } from "lucide-react"

import { auth } from "@/auth"

export default async function Dashboard() {
  const session = await auth();
  const isCounsellor = session?.user?.role === 'COUNSELLOR';
  const myId = session?.user?.id;
  const leadWhere = isCounsellor ? { counsellorId: myId } : {};
  const followUpWhere = isCounsellor ? { counsellorId: myId } : {};

  const [
    totalLeads,
    newLeads,
    hotLeads,
    applications,
    admissions,
    followUpsDue,
    overdueFollowUps,
    noFollowUpLeads
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: 'NEW' } }),
    prisma.lead.count({ where: { ...leadWhere, priority: 'HIGH' } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'APPLICATION' } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'ADMITTED' } }),
    prisma.followUp.count({ 
      where: { 
        ...followUpWhere,
        completed: false, 
        scheduledAt: { 
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        } 
      } 
    }),
    prisma.followUp.count({
      where: {
        ...followUpWhere,
        completed: false,
        scheduledAt: { lt: new Date() }
      }
    }),
    prisma.lead.count({
      where: { ...leadWhere, followUps: { none: {} } }
    })
  ])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
             <Activity className="text-blue-600 h-8 w-8" />
             Command Center
          </h1>
          <p className="text-slate-500 mt-2">Real-time overview of your admission pipeline.</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <Users size={14} className="text-blue-600"/> Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{totalLeads}</div>
          </CardContent>
        </Card>
        
        {/* Card 2 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <UserPlus size={14} className="text-green-500"/> New Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{newLeads}</div>
          </CardContent>
        </Card>
        
        {/* Card 3 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <Flame size={14} className="text-orange-500"/> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{hotLeads}</div>
          </CardContent>
        </Card>
        
        {/* Card 4 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <Clock size={14} className="text-amber-500"/> Due Today
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{followUpsDue}</div>
          </CardContent>
        </Card>

        {/* Card 5 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <BookOpen size={14} className="text-indigo-500"/> Apps
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{applications}</div>
          </CardContent>
        </Card>

        {/* Card 6 */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200/60 bg-white/60 backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <CardHeader className="pb-2 pt-5 px-5 z-10 relative">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600"/> Admissions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 z-10 relative">
            <div className="text-3xl font-black text-slate-900">{admissions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Center */}
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-rose-200/50 bg-white/80 backdrop-blur overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-orange-400"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2 font-bold">
              <AlertCircle size={20} className="text-rose-500"/> Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/leads?filter=no-followup" className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="font-semibold text-slate-700">Leads with no follow-up</div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-100 text-slate-800 py-1 px-3 rounded-full text-sm font-bold">{noFollowUpLeads}</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>
            
            <Link href="/follow-ups?filter=overdue" className="group flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md transition-all">
              <div className="font-semibold text-rose-800">Overdue follow-ups</div>
              <div className="flex items-center gap-3">
                <span className="bg-rose-200 text-rose-900 py-1 px-3 rounded-full text-sm font-bold">{overdueFollowUps}</span>
                <ArrowRight size={18} className="text-rose-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </CardContent>
        </Card>
        
        {/* Funnel Preview */}
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white/80 backdrop-blur overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800 font-bold">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-10">
            <div className="flex justify-between items-center h-full px-4">
               <div className="text-center flex-1 relative">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">New</div>
                 <div className="text-4xl font-light text-slate-800 drop-shadow-sm">{newLeads}</div>
               </div>
               <div className="w-12 h-px bg-slate-300 relative">
                 <ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={24}/>
               </div>
               <div className="text-center flex-1 relative">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">App</div>
                 <div className="text-4xl font-light text-slate-800 drop-shadow-sm">{applications}</div>
               </div>
               <div className="w-12 h-px bg-slate-300 relative">
                 <ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={24}/>
               </div>
               <div className="text-center flex-1 relative">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Admit</div>
                 <div className="text-4xl font-black text-emerald-600 drop-shadow-sm">{admissions}</div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
