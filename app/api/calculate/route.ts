import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateSolarSystem } from "@/lib/calculator/engine";
import type { SaveResult, SolarInputPayload } from "@/lib/calculator/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://solarcalc.sanchez.ph";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SolarInputPayload;
    const result = calculateSolarSystem(body);

    let save: SaveResult = {
      attempted: body.save_project,
      saved: false,
    };

    if (body.save_project) {
      const session = await auth();
      const email = session?.user?.email;

      if (!email) {
        save = {
          attempted: true,
          saved: false,
          reason: "Sign in with Google to save this project.",
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

    return NextResponse.json({ result, save }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request payload",
      },
      { status: 400 },
    );
  }
}