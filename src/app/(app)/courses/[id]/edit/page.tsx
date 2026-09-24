import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { saveCourse } from "@/actions/admin"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const course = await prisma.course.findUnique({ where: { id: (await params).id } })
  if (!course) return notFound()

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Course</h1>
        <p className="text-slate-500">Update course details.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form action={saveCourse} className="space-y-6">
            <input type="hidden" name="id" value={course.id} />
            
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input id="name" name="name" required defaultValue={course.name} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
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
