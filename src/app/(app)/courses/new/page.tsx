import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCourse } from "@/actions/admin"
import Link from "next/link"

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add New Course</h1>
        <p className="text-slate-500">Create a new course offering.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={saveCourse} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. B.Tech Computer Science" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="e.g. Engineering & Tech" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" placeholder="e.g. 4 Years" />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Course</Button>
              <Link href="/courses">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
