import prisma from "@/lib/prisma"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  const leadsByStatus = await prisma.lead.groupBy({
    by: ['status'],
    _count: true
  });
  
  const leadsBySource = await prisma.lead.groupBy({
    by: ['source'],
    _count: true
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Leads by Status</h3>
          <div className="space-y-3">
            {leadsByStatus.map(s => (
              <div key={s.status} className="flex justify-between items-center">
                <span className="text-gray-600">{s.status}</span>
                <span className="font-medium">{s._count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {leadsBySource.map(s => (
              <div key={s.source} className="flex justify-between items-center">
                <span className="text-gray-600">{s.source}</span>
                <span className="font-medium">{s._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
