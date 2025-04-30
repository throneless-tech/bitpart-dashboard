"use server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const validateCode = async (prevState, formData) => {
  let redirectPath = null;

  try {
    const inviteCode = await prisma.inviteCode.findUnique({
      where: {
        code: formData.get("code"),
      },
    });

    if (!inviteCode) {
      return {
        error: "Invite code is not valid. Please try again.",
      };
    } else if (inviteCode.used) {
      return {
        error:
          "Invite code has already been used. Please enter a different code or contact an administrator.",
      };
    }

    const updateInviteCode = await prisma.inviteCode.update({
      where: {
        code: inviteCode.code,
      },
      data: {
        used: true,
      },
    });

    redirectPath = "/signup";
  } catch (e) {
    console.log(e);
  } finally {
    if (redirectPath) {
      return redirect(redirectPath);
    }
  }
};
