import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function CounsellorsPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  const counsellors = await prisma.user.findMany({
    where: { role: 'COUNSELLOR' },
    include: { 
       assignedLeads: {
         select: { status: true, priority: true }
       },
       followUps: { select: { completed: true } }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Counsellors</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">+ Add Counsellor</Button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Counsellor</th>
                <th className="px-4 py-3 text-center">Total Leads</th>
                <th className="px-4 py-3 text-center">Hot Leads</th>
                <th className="px-4 py-3 text-center">Apps / Admits</th>
                <th className="px-4 py-3 text-center">Conversion</th>
                <th className="px-4 py-3 text-center">Follow-ups Done</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {counsellors.map(c => {
                const total = c.assignedLeads.length;
                const hot = c.assignedLeads.filter(l => l.priority === 'HIGH').length;
                const apps = c.assignedLeads.filter(l => ['APPLICATION', 'ADMITTED'].includes(l.status)).length;
                const admits = c.assignedLeads.filter(l => l.status === 'ADMITTED').length;
                const conversion = total > 0 ? Math.round((admits / total) * 100) : 0;
                
                const fTotal = c.followUps.length;
                const fDone = c.followUps.filter(f => f.completed).length;
                const fRate = fTotal > 0 ? Math.round((fDone / fTotal) * 100) : 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.email}</div>
                      {!c.active && <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded mt-1 inline-block font-bold">INACTIVE</span>}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-slate-700">{total}</td>
                    <td className="px-4 py-4 text-center text-orange-600 font-medium">{hot}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-indigo-600 font-medium">{apps}</span> / <span className="text-emerald-600 font-bold">{admits}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${conversion}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{conversion}%</span>
                    </td>
                    <td className="px-4 py-4 text-center text-slate-700 text-xs">
                      {fDone} / {fTotal} ({fRate}%)
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                      <Button variant="ghost" size="sm" className={c.active ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
