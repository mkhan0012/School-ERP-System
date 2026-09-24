const fs = require('fs');
const path = require('path');

function write(filePath, content) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n');
}

// Meta API for dropdowns
write('src/app/api/meta/route.ts', `
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const courses = await prisma.course.findMany({ where: { active: true } });
  const counsellors = await prisma.user.findMany({ where: { role: 'COUNSELLOR', active: true } });
  return NextResponse.json({ courses, counsellors });
}
`);

// Create Lead Action Update
write('src/app/(app)/leads/new/page.tsx', `
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { createLead } from "@/actions/lead"

export default function NewLeadPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [counsellors, setCounsellors] = useState<any[]>([])
  
  useEffect(() => {
    fetch('/api/meta').then(r => r.json()).then(d => {
      setCourses(d.courses)
      setCounsellors(d.counsellors)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    const res = await createLead(data)
    if (res.error) {
       alert("Error: " + res.error)
    } else {
       router.push(\`/leads/\${res.lead.id}\`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="courseId">Course *</Label>
                <select id="courseId" name="courseId" required className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">Select course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="counsellorId">Counsellor</Label>
                <select id="counsellorId" name="counsellorId" className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="">Select counsellor...</option>
                  {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="source">Source *</Label>
                <select id="source" name="source" required className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm">
                  {['WEBSITE', 'WHATSAPP', 'PHONE', 'WALK_IN', 'FAIR', 'CAMPAIGN', 'OTHER'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="priority">Priority *</Label>
                <select id="priority" name="priority" required className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>
            <Button type="submit">Create Lead</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
`);

// Lead Details Page
write('src/app/(app)/leads/[id]/page.tsx', `
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function LeadDetails({ params }: { params: { id: string } }) {
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
            <span className={\`px-2 py-1 rounded-md text-xs font-medium \${lead.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}\`}>{lead.priority}</span>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Schedule Follow-up</Button>
           <Button variant="outline">Change Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="text-gray-500">Phone:</span> {lead.phone}</div>
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
            <div><span className="text-gray-500">Created Date:</span> {lead.createdAt.toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Activity Timeline</h2>
      <div className="space-y-4">
        {lead.activities.map(act => (
          <div key={act.id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">{act.createdAt.toLocaleString()} - {act.user?.name || 'System'}</div>
            <div className="font-medium">{act.action}</div>
            <div className="text-gray-700 text-sm mt-1">{act.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
`);

// Follow Ups Page
write('src/app/(app)/follow-ups/page.tsx', `
import prisma from "@/lib/prisma"

export default async function FollowUpsPage() {
  const followUps = await prisma.followUp.findMany({
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
                <td className="px-4 py-3">{f.scheduledAt.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{f.lead.name}</td>
                <td className="px-4 py-3">{f.type}</td>
                <td className="px-4 py-3">{f.counsellor.name}</td>
                <td className="px-4 py-3">
                  <span className={\`px-2 py-1 rounded-md text-xs font-medium \${f.completed ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}\`}>
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
`);

// Counsellors Page
write('src/app/(app)/counsellors/page.tsx', `
import prisma from "@/lib/prisma"

export default async function CounsellorsPage() {
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
`);

// Courses Page
write('src/app/(app)/courses/page.tsx', `
import prisma from "@/lib/prisma"

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { leads: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
      
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Course Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total Leads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={\`px-2 py-1 rounded-md text-xs font-medium \${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}\`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">{c._count.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`);

// Reports Page
write('src/app/(app)/reports/page.tsx', `
import prisma from "@/lib/prisma"

export default async function ReportsPage() {
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
`);

console.log("Full app built");
