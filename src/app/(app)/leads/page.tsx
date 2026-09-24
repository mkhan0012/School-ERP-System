import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import { auth } from "@/auth"

export default async function LeadsPage() {
  const session = await auth();
  const isCounsellor = session?.user?.role === 'COUNSELLOR';
  
  const leads = await prisma.lead.findMany({
    where: isCounsellor ? { counsellorId: session?.user?.id } : undefined,
    include: { course: true, counsellor: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <Link href="/leads/new">
          <Button>+ Add Lead</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Counsellor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="block w-full">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">{lead.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{lead.course.name}</td>
                <td className="px-4 py-3 text-gray-700">{lead.source}</td>
                <td className="px-4 py-3 text-gray-700">{lead.counsellor?.name || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{lead.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${lead.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                    {lead.priority}
                  </span>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
