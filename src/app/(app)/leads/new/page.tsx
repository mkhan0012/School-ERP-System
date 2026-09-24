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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
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
