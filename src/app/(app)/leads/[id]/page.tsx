import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { auth } from "@/auth"

export default async function LeadDetails({ params }: { params: { id: string } }) {
  const session = await auth();
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { course: true, counsellor: true, activities: { orderBy: { createdAt: 'desc' }, include: { user: true } } }
  })

  if (!lead) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">{lead.status}</span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${lead.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>{lead.priority}</span>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Schedule Follow-up</Button>
           <Button variant="outline">Change Status</Button>
           {session?.user?.role !== 'COUNSELLOR' && (
             <Button variant="outline">Reassign</Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-gray-500">Phone:</span> <span className="font-mono ml-2">{lead.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}</span></div>
            <div><span className="text-gray-500">Email:</span> {lead.email || 'N/A'}</div>
            <div><span className="text-gray-500">City:</span> {lead.city || 'N/A'}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle>Admission Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-gray-500">Course:</span> {lead.course.name}</div>
            <div><span className="text-gray-500">Source:</span> {lead.source}</div>
            <div><span className="text-gray-500">Counsellor:</span> {lead.counsellor?.name || 'Unassigned'}</div>
            <div><span className="text-gray-500">Created Date:</span> {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(lead.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Activity Timeline</h2>
      <div className="space-y-4">
        {lead.activities.map(act => (
          <div key={act.id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(act.createdAt)} - {act.user?.name || 'System'}</div>
            <div className="font-medium">{act.action}</div>
            <div className="text-gray-700 text-sm mt-1">{act.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
