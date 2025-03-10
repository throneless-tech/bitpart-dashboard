"use server"
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export const register = async (values) => {
  const { username, password } = values;

  try {
    const userFound = await prisma.user.findUnique({
      where: {
        username,
      }
    });

    if (userFound) {
      return {
        error: 'Username already exists.'
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      }
    });
  } catch (e) {
    console.log(e);
  }
}