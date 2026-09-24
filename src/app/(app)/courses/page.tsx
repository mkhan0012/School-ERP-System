import prisma from "@/lib/prisma"

import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CoursesPage() {
  const session = await auth();
  if (session?.user?.role === 'COUNSELLOR') {
    redirect('/');
  }

  const courses = await prisma.course.findMany({
    include: { _count: { select: { leads: true } } }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
      
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3">Course Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total Leads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${c.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">{c._count.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
