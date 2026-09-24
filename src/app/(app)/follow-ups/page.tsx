import prisma from "@/lib/prisma"

import { auth } from "@/auth"

export default async function FollowUpsPage() {
  const session = await auth();
  const isCounsellor = session?.user?.role === 'COUNSELLOR';

  const followUps = await prisma.followUp.findMany({
    where: isCounsellor ? { counsellorId: session?.user?.id } : undefined,
    include: { lead: true, counsellor: true },
    orderBy: { scheduledAt: 'asc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
      
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Counsellor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {followUps.map(f => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(f.scheduledAt)}</td>
                <td className="px-4 py-3 font-medium">{f.lead.name}</td>
                <td className="px-4 py-3">{f.type}</td>
                <td className="px-4 py-3">{f.counsellor.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${f.completed ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {f.completed ? 'Completed' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {followUps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No follow-ups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
