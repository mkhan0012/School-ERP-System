import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const courses = await prisma.course.findMany({ where: { active: true } });
  
  // If counsellor, they shouldn't see or assign other counsellors
  const counsellors = role === 'COUNSELLOR' 
    ? [] 
    : await prisma.user.findMany({ where: { role: 'COUNSELLOR', active: true } });
    
  return NextResponse.json({ courses, counsellors, role, userId });
}
