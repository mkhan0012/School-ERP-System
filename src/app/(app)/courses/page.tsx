import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toggleCourseStatus } from "@/actions/admin"

export default async function CoursesPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  const courses = await prisma.course.findMany({
    include: { 
      leads: { select: { status: true } }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <Link href="/courses/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">+ Add Course</Button>
        </Link>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Course Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3 text-center">Duration</th>
              <th className="px-4 py-3 text-center">Total Leads</th>
              <th className="px-4 py-3 text-center">Applications</th>
              <th className="px-4 py-3 text-center">Admissions</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map(c => {
              const total = c.leads.length;
              const apps = c.leads.filter(l => ['APPLICATION', 'ADMITTED'].includes(l.status)).length;
              const admits = c.leads.filter(l => l.status === 'ADMITTED').length;

              return (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    {!c.active && <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded mt-1 inline-block font-bold">INACTIVE</span>}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{c.department || '-'}</td>
                  <td className="px-4 py-4 text-center text-slate-700">{c.duration || 'N/A'}</td>
                  <td className="px-4 py-4 text-center font-medium text-slate-700">{total}</td>
                  <td className="px-4 py-4 text-center text-indigo-600 font-medium">{apps}</td>
                  <td className="px-4 py-4 text-center text-emerald-600 font-bold">{admits}</td>
                  <td className="px-4 py-4 text-right flex justify-end items-center gap-2">
                    <Link href={`/courses/${c.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <form action={toggleCourseStatus}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="current" value={c.active ? 'true' : 'false'} />
                      <Button type="submit" variant="ghost" size="sm" className={c.active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}>
                        {c.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
