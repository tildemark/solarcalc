import { NextResponse } from "next/server";
import { safeAuth } from "@/auth";
import { getBuildExpiryCutoff } from "@/lib/build-retention";
import { prisma } from "@/lib/prisma";
import { calculateSolarSystem } from "@/lib/calculator/engine";
import type { SaveResult, ShareResult, SolarInputPayload } from "@/lib/calculator/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://solarcalc.sanchez.ph";
const GUEST_USER_EMAIL = "guest@solarcalc.local";
const GUEST_USER_NAME = "SolarCalc Guest";

export async function POST(request: Request) {
  try {
    const retentionCutoff = getBuildExpiryCutoff();
    await prisma.project.deleteMany({
      where: {
        createdAt: {
          lt: retentionCutoff,
        },
      },
    });

    const body = (await request.json()) as SolarInputPayload;
    const result = calculateSolarSystem(body);

    const guestUser = await prisma.user.upsert({
      where: { email: GUEST_USER_EMAIL },
      update: {},
      create: {
        email: GUEST_USER_EMAIL,
        name: GUEST_USER_NAME,
      },
      select: {
        id: true,
      },
    });

    const sharedProject = await prisma.project.create({
      data: {
        userId: guestUser.id,
        name: `${result.ogMetadata.title} (Shared)`,
        input: body,
        result,
        isPublic: true,
      },
      select: {
        id: true,
        shareId: true,
      },
    });

    const share: ShareResult = {
      attempted: true,
      saved: true,
      projectId: sharedProject.id,
      shareUrl: `${APP_URL}/p/${sharedProject.shareId}`,
    };

    let save: SaveResult = {
      attempted: body.save_project,
      saved: false,
    };

    if (body.save_project) {
      const session = await safeAuth();
      const email = session?.user?.email;

      if (!email) {
        save = {
          attempted: true,
          saved: false,
          reason: "Sign in with Google to save builds to your account.",
        };
      } else {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (!user) {
          save = {
            attempted: true,
            saved: false,
            reason: "Authenticated account was not found in the local database.",
          };
        } else {
          const project = await prisma.project.create({
            data: {
              userId: user.id,
              name: result.ogMetadata.title,
              input: body,
              result,
              isPublic: true,
            },
            select: {
              id: true,
              shareId: true,
            },
          });

          save = {
            attempted: true,
            saved: true,
            projectId: project.id,
            shareUrl: `${APP_URL}/p/${project.shareId}`,
          };
        }
      }
    }

    return NextResponse.json({ result, save, share }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request payload",
      },
      { status: 400 },
    );
  }
}