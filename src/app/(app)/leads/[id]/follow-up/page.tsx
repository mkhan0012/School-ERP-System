import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { scheduleFollowUp } from "@/actions/admin"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"

export default async function ScheduleFollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const lead = await prisma.lead.findUnique({ where: { id: (await params).id } })
  if (!lead) return notFound()

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 mt-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schedule Follow-up</h1>
        <p className="text-slate-500">For lead: <strong className="text-blue-600">{lead.name}</strong></p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={scheduleFollowUp} className="space-y-6">
            <input type="hidden" name="leadId" value={lead.id} />
            <input type="hidden" name="counsellorId" value={lead.counsellorId || session?.user?.id} />
            <input type="hidden" name="userId" value={session?.user?.id} />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Follow-up Type</Label>
                <select id="type" name="type" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white" required>
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">In-person Meeting</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input type="date" id="date" name="date" required min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input type="time" id="time" name="time" required />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">Confirm Schedule</Button>
              <Link href={`/leads/${lead.id}`} className="w-full">
                <Button variant="outline" type="button" className="w-full">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
