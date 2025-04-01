"use server"
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export const register = async (prevState, formData) => {
  let redirectPath = null;
  
  const password = formData.get("password");
  const passwordConfirm = formData.get("passwordConfirm");
  const username = formData.get("username");
  
  try {
    if (password !== passwordConfirm) {
      return {
        error: {
          password: 'Passwords do not match.'
        }
      }
    }

    const userFound = await prisma.user.findUnique({
      where: {
        username,
      }
    });

    if (userFound) {
      return {
        error: {
          username: 'Username already exists.'
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      }
    });

    redirectPath = '/dashboard';

  } catch (e) {
    console.log(e);
  } finally {
    if (redirectPath) {
      return redirect(redirectPath);
    }
  }
}