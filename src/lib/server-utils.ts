import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth-no-edge";
import prisma from "./db";
import { Pet, User } from "@prisma/client";

export const checkAuth = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return session;
};

export const getUserByEmail = async (email: User["email"]) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

export const getPetById = async (petId: Pet["id"]) => {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  return pet;
};

export const getPetsByUserId = async (userId: User["id"]) => {
  const pets = await prisma.pet.findMany({
    where: {
      userId,
    },
  });

  return pets;
};
