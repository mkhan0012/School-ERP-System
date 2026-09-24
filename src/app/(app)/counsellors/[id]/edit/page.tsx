import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCounsellor } from "@/actions/admin"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditCounsellorPage({ params }: { params: Promise<{ id: string }> }) {
  const counsellor = await prisma.user.findUnique({ where: { id: (await params).id } })
  if (!counsellor) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Counsellor</h1>
        <p className="text-slate-500">Update staff details.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={saveCounsellor} className="space-y-6">
            <input type="hidden" name="id" value={counsellor.id} />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required defaultValue={counsellor.name || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required defaultValue={counsellor.email || ''} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              <Link href="/counsellors">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
