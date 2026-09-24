"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- COURSES ---

export async function toggleCourseStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const current = formData.get('current') === 'true';
  await prisma.course.update({
    where: { id },
    data: { active: !current }
  });
  revalidatePath('/courses');
}

export async function saveCourse(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const department = formData.get('department') as string;
  const duration = formData.get('duration') as string;
  
  if (id) {
    await prisma.course.update({
      where: { id },
      data: { name, department, duration }
    });
  } else {
    await prisma.course.create({
      data: { name, department, duration, active: true }
    });
  }
  revalidatePath('/courses');
  redirect('/courses');
}

// --- COUNSELLORS ---

export async function toggleCounsellorStatus(formData: FormData) {
  const id = formData.get('id') as string;
  const current = formData.get('current') === 'true';
  await prisma.user.update({
    where: { id },
    data: { active: !current }
  });
  revalidatePath('/counsellors');
}

export async function saveCounsellor(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  if (id) {
    await prisma.user.update({
      where: { id },
      data: { name, email }
    });
  } else {
    // Generate random default password for new counsellors
    const bcrypt = require('bcryptjs');
    const password = await bcrypt.hash('counsellor123', 10);
    
    await prisma.user.create({
      data: { name, email, password, role: 'COUNSELLOR', active: true }
    });
  }
  revalidatePath('/counsellors');
  redirect('/counsellors');
}

// --- LEADS ACTIONS ---
import { auth } from "@/auth"

export async function changeLeadStatus(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const status = formData.get('status') as any;

  await prisma.lead.update({
    where: { id },
    data: { status }
  });

  await prisma.activity.create({
    data: {
       leadId: id,
       userId,
       action: 'STATUS_CHANGED',
       description: `Status changed to ${status}`
    }
  });

  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function reassignLead(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const counsellorId = formData.get('counsellorId') as string;

  const counsellor = await prisma.user.findUnique({ where: { id: counsellorId } });

  await prisma.lead.update({
    where: { id },
    data: { counsellorId }
  });

  await prisma.activity.create({
    data: {
       leadId: id,
       userId,
       action: 'REASSIGNED',
       description: `Reassigned to ${counsellor?.name || 'Unassigned'}`
    }
  });

  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function scheduleFollowUp(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const leadId = formData.get('leadId') as string;
  const type = formData.get('type') as any;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const counsellorId = formData.get('counsellorId') as string;

  const scheduledAt = new Date(`${date}T${time}`);

  await prisma.followUp.create({
    data: {
       leadId,
       counsellorId,
       type,
       scheduledAt,
       completed: false
    }
  });

  await prisma.activity.create({
    data: {
       leadId,
       userId,
       action: 'FOLLOW_UP_SCHEDULED',
       description: `Scheduled ${type} follow-up for ${date}`
    }
  });

  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

export async function completeFollowUp(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const id = formData.get('id') as string;
  const leadId = formData.get('leadId') as string;
  
  await prisma.followUp.update({
    where: { id },
    data: { completed: true, completedAt: new Date() }
  });

  await prisma.activity.create({
    data: {
       leadId,
       userId,
       action: 'FOLLOW_UP_COMPLETED',
       description: `Marked follow-up as completed.`
    }
  });

  revalidatePath('/follow-ups');
}
