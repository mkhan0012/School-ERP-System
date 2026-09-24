import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FollowUpsPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await auth();
  const isCounsellor = session?.user?.role === 'COUNSELLOR';
  const filter = searchParams.filter || 'today';

  const now = new Date();
  const startOfToday = new Date(now.setHours(0,0,0,0));
  const endOfToday = new Date(now.setHours(23,59,59,999));

  let where: any = isCounsellor ? { counsellorId: session?.user?.id } : {};

  if (filter === 'overdue') {
    where.completed = false;
    where.scheduledAt = { lt: startOfToday };
  } else if (filter === 'today') {
    where.completed = false;
    where.scheduledAt = { gte: startOfToday, lt: endOfToday };
  } else if (filter === 'upcoming') {
    where.completed = false;
    where.scheduledAt = { gte: endOfToday };
  } else if (filter === 'completed') {
    where.completed = true;
  }

  const followUps = await prisma.followUp.findMany({
    where,
    include: { lead: true, counsellor: true },
    orderBy: { scheduledAt: filter === 'completed' ? 'desc' : 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-slate-900">Follow-ups</h1>
      
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <Link href="/follow-ups?filter=overdue">
           <Button variant={filter === 'overdue' ? 'default' : 'ghost'} className={filter === 'overdue' ? 'bg-red-600 hover:bg-red-700' : ''}>Overdue</Button>
        </Link>
        <Link href="/follow-ups?filter=today">
           <Button variant={filter === 'today' ? 'default' : 'ghost'} className={filter === 'today' ? 'bg-blue-600 hover:bg-blue-700' : ''}>Due Today</Button>
        </Link>
        <Link href="/follow-ups?filter=upcoming">
           <Button variant={filter === 'upcoming' ? 'default' : 'ghost'} className={filter === 'upcoming' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}>Upcoming</Button>
        </Link>
        <Link href="/follow-ups?filter=completed">
           <Button variant={filter === 'completed' ? 'default' : 'ghost'} className={filter === 'completed' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>Completed</Button>
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Counsellor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {followUps.map(f => (
              <tr key={f.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-4 text-slate-700 font-medium">
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(f.scheduledAt)}
                </td>
                <td className="px-4 py-4">
                  <Link href={`/leads/${f.leadId}`} className="font-bold text-blue-600 hover:underline">{f.lead.name}</Link>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{f.type}</span>
                </td>
                <td className="px-4 py-4 text-slate-700">{f.counsellor.name}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${f.completed ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (f.scheduledAt < new Date() ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100')}`}>
                    {f.completed ? 'Completed' : (f.scheduledAt < new Date() ? 'Overdue' : 'Pending')}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  {!f.completed ? (
                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">Complete</Button>
                  ) : (
                    <span className="text-slate-400 italic text-xs">{f.outcome || 'No outcome'}</span>
                  )}
                </td>
              </tr>
            ))}
            {followUps.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No {filter} follow-ups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
