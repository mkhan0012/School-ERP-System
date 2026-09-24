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
  const [role, setRole] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  
  useEffect(() => {
    fetch('/api/meta').then(r => r.json()).then(d => {
      setCourses(d.courses)
      setCounsellors(d.counsellors)
      setRole(d.role)
      setUserId(d.userId)
    })
  }, [])

  const [duplicateWarning, setDuplicateWarning] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    // Add user id for activity
    data.userId = userId;

    const res = await createLead(data)
    if (res.error === 'DUPLICATE_PHONE') {
       setDuplicateWarning(res.lead)
    } else if (res.error) {
       alert("Error: " + res.error)
    } else {
       router.push(`/leads/${res.lead.id}`)
    }
  }

  const handleForceCreate = async () => {
    const form = document.querySelector('form') as HTMLFormElement
    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
    data.userId = userId;
    data.force = 'true';
    
    const res = await createLead(data)
    if (res.error) {
       alert("Error: " + res.error)
    } else {
       router.push(`/leads/${res.lead.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
      <Card>
        <CardContent className="pt-6">
          {duplicateWarning && (
            <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-xl">
              <h3 className="text-lg font-bold text-orange-800 mb-2">⚠️ Possible Duplicate Lead Found</h3>
              <p className="text-orange-900 text-sm mb-4">A lead with this phone number already exists in the system.</p>
              <div className="bg-white p-3 rounded-lg border border-orange-100 text-sm mb-4 space-y-1">
                <div><strong>Name:</strong> {duplicateWarning.name}</div>
                <div><strong>Status:</strong> {duplicateWarning.status}</div>
                <div><strong>Created:</strong> {new Date(duplicateWarning.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={() => router.push(`/leads/${duplicateWarning.id}`)} variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
                  Open Existing Lead
                </Button>
                <Button type="button" onClick={handleForceCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Create Anyway
                </Button>
                <Button type="button" onClick={() => setDuplicateWarning(null)} variant="ghost" className="text-slate-500">
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={`space-y-6 ${duplicateWarning ? 'opacity-50 pointer-events-none' : ''}`}>
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
              {role !== 'COUNSELLOR' && (
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="counsellorId">Counsellor</Label>
                  <select id="counsellorId" name="counsellorId" className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm">
                    <option value="">Select counsellor...</option>
                    {counsellors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {role === 'COUNSELLOR' && (
                <input type="hidden" name="counsellorId" value={userId || ''} />
              )}
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
