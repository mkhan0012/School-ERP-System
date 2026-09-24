import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ReportsDashboard } from "./reports-client"

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  // 1. Leads by Status
  const leadsByStatus = await prisma.lead.groupBy({
    by: ['status'],
    _count: true
  });

  // 2. Leads by Source
  const leadsBySource = await prisma.lead.groupBy({
    by: ['source'],
    _count: true
  });

  // 3. Conversion Funnel (Cumulative)
  const totalLeads = await prisma.lead.count();
  const contacted = await prisma.lead.count({ where: { status: { in: ['CONTACTED', 'INTERESTED', 'APPLICATION', 'ADMITTED', 'NOT_INTERESTED', 'LOST'] } } })
  const interested = await prisma.lead.count({ where: { status: { in: ['INTERESTED', 'APPLICATION', 'ADMITTED'] } } })
  const applications = await prisma.lead.count({ where: { status: { in: ['APPLICATION', 'ADMITTED'] } } })
  const admissions = await prisma.lead.count({ where: { status: 'ADMITTED' } })

  const funnelData = [
    { name: 'Total', count: totalLeads },
    { name: 'Contacted', count: contacted },
    { name: 'Interested', count: interested },
    { name: 'Application', count: applications },
    { name: 'Admitted', count: admissions }
  ];

  // 4. Counsellor Performance
  const counsellors = await prisma.user.findMany({
    where: { role: 'COUNSELLOR' },
    select: {
       name: true,
       assignedLeads: { select: { status: true } }
    }
  });

  const counsellorPerf = counsellors.map(c => {
    const total = c.assignedLeads.length;
    const apps = c.assignedLeads.filter(l => l.status === 'APPLICATION' || l.status === 'ADMITTED').length;
    const admits = c.assignedLeads.filter(l => l.status === 'ADMITTED').length;
    return {
       name: (c.name || 'Unknown').split(' ')[0],
       total,
       applications: apps,
       admissions: admits
    }
  });

  // 5. Follow-up Performance
  const followUps = await prisma.followUp.findMany({
     select: { completed: true, scheduledAt: true }
  });
  
  const now = new Date();
  const completed = followUps.filter(f => f.completed).length;
  const overdue = followUps.filter(f => !f.completed && f.scheduledAt < now).length;
  const upcoming = followUps.filter(f => !f.completed && f.scheduledAt >= now).length;

  const followUpData = [
    { name: 'Completed', value: completed, fill: '#10b981' },
    { name: 'Overdue', value: overdue, fill: '#ef4444' },
    { name: 'Upcoming', value: upcoming, fill: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="text-slate-500">Institution-wide performance metrics</p>
      </div>
      
      <ReportsDashboard 
         statusData={leadsByStatus.map(s => ({ name: s.status, value: s._count }))}
         sourceData={leadsBySource.map(s => ({ name: s.source, value: s._count }))}
         funnelData={funnelData}
         counsellorData={counsellorPerf}
         followUpData={followUpData}
      />
    </div>
  )
}
