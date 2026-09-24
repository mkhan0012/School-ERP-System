import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Users, Flame, UserPlus, BookOpen, Activity, AlertTriangle } from "lucide-react"

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
    contactedLeads,
    interestedLeads,
    applications,
    admissions,
    followUpsDue,
    overdueFollowUps,
    noFollowUpLeads,
    hotLeadsNoActivity,
    ageingLeads,
    unassignedLeads
  ] = await Promise.all([
    prisma.lead.count({ where: leadWhere }),
    prisma.lead.count({ where: { ...leadWhere, status: 'NEW' } }),
    prisma.lead.count({ where: { ...leadWhere, priority: 'HIGH' } }),
    // Funnel cumulative logical stats
    prisma.lead.count({ where: { ...leadWhere, status: { in: ['CONTACTED', 'INTERESTED', 'APPLICATION', 'ADMITTED', 'NOT_INTERESTED', 'LOST'] } } }),
    prisma.lead.count({ where: { ...leadWhere, status: { in: ['INTERESTED', 'APPLICATION', 'ADMITTED'] } } }),
    prisma.lead.count({ where: { ...leadWhere, status: { in: ['APPLICATION', 'ADMITTED'] } } }),
    prisma.lead.count({ where: { ...leadWhere, status: 'ADMITTED' } }),
    // Follow ups
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
    }),
    // Hot leads no recent activity (no activity in last 3 days)
    prisma.lead.count({
      where: {
         ...leadWhere,
         priority: 'HIGH',
         activities: {
           none: { createdAt: { gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }
         }
      }
    }),
    // Ageing leads (created > 7 days ago and not admitted/lost)
    prisma.lead.count({
      where: {
         ...leadWhere,
         createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
         status: { notIn: ['ADMITTED', 'LOST', 'NOT_INTERESTED'] }
      }
    }),
    // Unassigned leads
    prisma.lead.count({
      where: { ...leadWhere, counsellorId: null }
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
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-rose-200/50 bg-white/80 backdrop-blur overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-orange-400"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2 font-bold">
              <AlertCircle size={20} className="text-rose-500"/> Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 flex flex-col overflow-auto max-h-[350px]">
            <Link href="/leads?filter=no-followup" className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="font-semibold text-slate-700">Leads with no follow-up</div>
              <div className="flex items-center gap-3">
                <span className="bg-slate-100 text-slate-800 py-1 px-3 rounded-full text-sm font-bold">{noFollowUpLeads}</span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>
            
            <Link href="/follow-ups?filter=overdue" className="group flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-200 hover:shadow-md transition-all">
              <div className="font-semibold text-rose-800">Overdue follow-ups</div>
              <div className="flex items-center gap-3">
                <span className="bg-rose-200 text-rose-900 py-1 px-3 rounded-full text-sm font-bold">{overdueFollowUps}</span>
                <ArrowRight size={18} className="text-rose-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/leads?filter=hot-stale" className="group flex items-center justify-between p-3 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="font-semibold text-orange-800 flex items-center gap-2"><Flame size={16}/> Hot leads without recent activity</div>
              <div className="flex items-center gap-3">
                <span className="bg-orange-200 text-orange-900 py-1 px-3 rounded-full text-sm font-bold">{hotLeadsNoActivity}</span>
                <ArrowRight size={18} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/leads?filter=ageing" className="group flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-200 hover:shadow-md transition-all">
              <div className="font-semibold text-amber-800 flex items-center gap-2"><AlertTriangle size={16}/> Ageing leads (&gt;7 days)</div>
              <div className="flex items-center gap-3">
                <span className="bg-amber-200 text-amber-900 py-1 px-3 rounded-full text-sm font-bold">{ageingLeads}</span>
                <ArrowRight size={18} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {!isCounsellor && (
              <Link href="/leads?filter=unassigned" className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-md transition-all">
                <div className="font-semibold text-slate-700">Unassigned leads</div>
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-800 py-1 px-3 rounded-full text-sm font-bold">{unassignedLeads}</span>
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
        
        {/* Funnel Preview */}
        <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 bg-white/80 backdrop-blur overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800 font-bold">Conversion Funnel (Cumulative)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-10 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center h-full px-2">
               <div className="text-center flex-1 relative">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Total</div>
                 <div className="text-2xl font-light text-slate-800 drop-shadow-sm">{totalLeads}</div>
               </div>
               <div className="w-8 h-px bg-slate-300 relative"><ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={20}/></div>
               
               <div className="text-center flex-1 relative">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact</div>
                 <div className="text-2xl font-light text-blue-600 drop-shadow-sm">{contactedLeads}</div>
               </div>
               <div className="w-8 h-px bg-slate-300 relative"><ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={20}/></div>

               <div className="text-center flex-1 relative hidden sm:block">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Interest</div>
                 <div className="text-2xl font-light text-indigo-500 drop-shadow-sm">{interestedLeads}</div>
               </div>
               <div className="w-8 h-px bg-slate-300 relative hidden sm:block"><ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={20}/></div>
               
               <div className="text-center flex-1 relative">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">App</div>
                 <div className="text-2xl font-light text-indigo-600 drop-shadow-sm">{applications}</div>
               </div>
               <div className="w-8 h-px bg-slate-300 relative"><ArrowRight className="absolute -top-3 -right-2 text-slate-300" size={20}/></div>
               
               <div className="text-center flex-1 relative">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Admit</div>
                 <div className="text-2xl font-black text-emerald-600 drop-shadow-sm">{admissions}</div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
