import { NextResponse } from "next/server";
import { getBuildExpiryCutoff } from "@/lib/build-retention";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ shareId: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { shareId } = await params;
  const retentionCutoff = getBuildExpiryCutoff();

  const project = await prisma.project.findUnique({
    where: { shareId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!project || !project.isPublic || project.createdAt < retentionCutoff) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const exportPayload = {
    projectId: project.id,
    shareId: project.shareId,
    name: project.name,
    owner: {
      name: project.user.name,
      email: project.user.email,
    },
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    input: project.input,
    result: project.result,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename=solarcalc-${project.shareId}.json`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
