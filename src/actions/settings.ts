"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const newPassword = formData.get("newPassword") as string

  const updateData: any = { name }

  if (newPassword && newPassword.length >= 6) {
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: updateData
  })

  revalidatePath("/settings")
  return { success: true }
}
