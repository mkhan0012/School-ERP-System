import prisma from "@/lib/prisma"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CounsellorsPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  const counsellors = await prisma.user.findMany({
    where: { role: 'COUNSELLOR' },
    include: { _count: { select: { assignedLeads: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Counsellors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {counsellors.map(c => (
          <div key={c.id} className="p-6 bg-white rounded-xl shadow border border-gray-200">
            <h3 className="font-semibold text-lg">{c.name}</h3>
            <p className="text-sm text-gray-500">{c.email}</p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
               <span className="text-sm text-gray-600">Assigned Leads</span>
               <span className="font-bold text-blue-600">{c._count.assignedLeads}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
