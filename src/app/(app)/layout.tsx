import { Sidebar } from "@/components/sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-transparent">
      <Sidebar role={session.user.role} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
