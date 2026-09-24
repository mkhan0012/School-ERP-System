import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCounsellor } from "@/actions/admin"
import Link from "next/link"

export default function NewCounsellorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add New Counsellor</h1>
        <p className="text-slate-500">Default password will be 'counsellor123'</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={saveCounsellor} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" required placeholder="john@example.com" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Counsellor</Button>
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
