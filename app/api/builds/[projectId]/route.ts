import { NextResponse } from "next/server";
import { safeAuth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ projectId: string }>;
};

export async function DELETE(_: Request, { params }: Params) {
  const { projectId } = await params;
  const session = await safeAuth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User account not found" }, { status: 404 });
  }

  const deleted = await prisma.project.deleteMany({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
