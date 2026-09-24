import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth } from "@/auth"

export default async function LeadsPage({ searchParams }: { searchParams: Promise<any> }) {
  const session = await auth();
  const isCounsellor = session?.user?.role === 'COUNSELLOR';
  
  const q = (await searchParams).q || "";
  const filter = (await searchParams).filter || "";

  // Base where clause
  let where: any = isCounsellor ? { counsellorId: session?.user?.id } : {};

  // Search logic
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { email: { contains: q, mode: 'insensitive' } }
    ]
  }

  // Filter logic
  if (filter === 'no-followup') {
    where.followUps = { none: {} }
  } else if (filter === 'unassigned') {
    where.counsellorId = null
  } else if (filter === 'hot-stale') {
    where.priority = 'HIGH'
    where.activities = { none: { createdAt: { gt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } } }
  } else if (filter === 'ageing') {
    where.createdAt = { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    where.status = { notIn: ['ADMITTED', 'LOST', 'NOT_INTERESTED'] }
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { 
      course: true, 
      counsellor: true,
      followUps: {
        where: { completed: false },
        orderBy: { scheduledAt: 'asc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const getAgeDays = (date: Date) => Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const getAgeLabel = (days: number) => {
    if (days <= 2) return <span className="text-emerald-600 font-medium">{days}d (Fresh)</span>
    if (days <= 7) return <span className="text-blue-600 font-medium">{days}d (Ageing)</span>
    if (days <= 15) return <span className="text-orange-600 font-medium">{days}d (At Risk)</span>
    return <span className="text-red-600 font-bold">{days}d (Stale)</span>
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <Link href="/leads/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">+ Add Lead</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <form className="flex-1 flex gap-2">
          <input 
            type="text" 
            name="q" 
            defaultValue={q} 
            placeholder="Search by name, phone, email..." 
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {filter && <input type="hidden" name="filter" value={filter} />}
          <Button type="submit" variant="outline">Search</Button>
          {(q || filter) && <Link href="/leads"><Button variant="outline">Clear</Button></Link>}
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Course / Source</th>
                <th className="px-4 py-3">Counsellor</th>
                <th className="px-4 py-3">Status & Priority</th>
                <th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Next Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map(lead => {
                const ageDays = getAgeDays(lead.createdAt)
                const nextFollowUp = lead.followUps[0]
                const counsellorName = lead.counsellor?.name || 'Unassigned'
                
                return (
                  <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer relative">
                    <td className="px-4 py-4">
                      <Link href={`/leads/${lead.id}`} className="absolute inset-0 z-10"></Link>
                      <div className="font-bold text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{lead.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <div className="font-medium">{lead.course.name}</div>
                      <div className="text-xs text-slate-400">{lead.source}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {lead.counsellor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {counsellorName.charAt(0).toUpperCase()}
                          </div>
                          <span>{counsellorName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-wider">{lead.status}</span>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${lead.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getAgeLabel(ageDays)}
                    </td>
                    <td className="px-4 py-4">
                       {nextFollowUp ? (
                         <div className="text-xs">
                           <div className="font-medium text-slate-800">{new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(nextFollowUp.scheduledAt)}</div>
                           <div className="text-slate-500">{nextFollowUp.type}</div>
                         </div>
                       ) : (
                         <span className="text-slate-400 text-xs italic">None scheduled</span>
                       )}
                    </td>
                  </tr>
                )
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-slate-400 text-xl">🔍</span>
                      </div>
                      <p className="font-medium text-slate-700">No leads found.</p>
                      <p className="text-xs">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
