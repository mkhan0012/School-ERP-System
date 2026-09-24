import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { changeLeadStatus } from "@/actions/admin"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"

export default async function ChangeStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const lead = await prisma.lead.findUnique({ where: { id: (await params).id } })
  if (!lead) return notFound()

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 mt-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change Status</h1>
        <p className="text-slate-500">For lead: <strong className="text-blue-600">{lead.name}</strong></p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={changeLeadStatus} className="space-y-6">
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="userId" value={session?.user?.id} />

            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <select id="status" name="status" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white" defaultValue={lead.status} required>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="INTERESTED">Interested</option>
                <option value="APPLICATION">Application</option>
                <option value="ADMITTED">Admitted</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">Update Status</Button>
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
