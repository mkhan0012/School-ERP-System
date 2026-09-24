import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { reassignLead } from "@/actions/admin"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"

export default async function ReassignPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
     redirect(`/leads/${(await params).id}`);
  }

  const lead = await prisma.lead.findUnique({ where: { id: (await params).id }, include: { counsellor: true } })
  if (!lead) return notFound()

  const counsellors = await prisma.user.findMany({ where: { role: 'COUNSELLOR', active: true }, orderBy: { name: 'asc' } })

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 mt-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reassign Lead</h1>
        <p className="text-slate-500">Current Counsellor: <strong className="text-blue-600">{lead.counsellor?.name || 'Unassigned'}</strong></p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={reassignLead} className="space-y-6">
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="userId" value={session?.user?.id} />

            <div className="space-y-2">
              <Label htmlFor="counsellorId">Assign To</Label>
              <select id="counsellorId" name="counsellorId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white" defaultValue={lead.counsellorId || ''} required>
                <option value="" disabled>Select a Counsellor</option>
                {counsellors.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white w-full">Reassign</Button>
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
