"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createLead(data: any) {
  const duplicate = await prisma.lead.findFirst({
    where: { phone: data.phone }
  });

  if (duplicate && !data.force) {
    return { error: 'DUPLICATE_PHONE', lead: duplicate };
  }

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      city: data.city || null,
      source: data.source,
      priority: data.priority,
      courseId: data.courseId,
      counsellorId: data.counsellorId || null,
      status: 'NEW'
    }
  });

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      userId: data.userId,
      action: 'CREATED',
      description: 'Lead created in the system',
    }
  });

  revalidatePath('/leads');
  return { success: true, lead };
}
