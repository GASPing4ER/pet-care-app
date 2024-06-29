"use server";

import { signIn, signOut } from "@/lib/auth-no-edge";
import prisma from "@/lib/db";
import { authScema, petFormSchema, petIdSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { checkAuth, getPetById } from "@/lib/server-utils";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// --- user actions ---

export const login = async (prevState: unknown, authData: unknown) => {
  // validation
  if (!(authData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  try {
    await signIn("credentials", authData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return {
            message: "Invalid credentials",
          };
        }
        default: {
          return {
            message: "Failed to sign in",
          };
        }
      }
    }
    throw error;
  }

  redirect("/app/dashboard");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};

export const signup = async (prevState: unknown, authData: unknown) => {
  // check if authData is a FormData object
  if (!(authData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  // convert FormData to object
  const formDataEntries = Object.fromEntries(authData.entries());

  // validate the form data
  const validatedFormData = authScema.safeParse(formDataEntries);
  if (!validatedFormData.success) {
    return {
      message: "Invalid form data",
    };
  }

  const { email, password } = validatedFormData.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already exists",
        };
      }
      return {
        message: "Failed to sign up",
      };
    }
  }
  await signIn("credentials", authData);
};

// --- pet actions ---

export const addPet = async (pet: unknown) => {
  // authentication
  const session = await checkAuth();

  // validation
  const validatedPet = petFormSchema.safeParse(pet);

  if (!validatedPet.success) {
    return {
      message: "Invalid pet data",
    };
  }

  // database mutation
  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
  } catch (error) {
    return {
      message: "Failed to add pet",
    };
  }

  revalidatePath("/app", "layout");
};

export const editPet = async (petId: unknown, pet: unknown) => {
  // authentication
  const session = await checkAuth();

  // validation
  const validatedPet = petFormSchema.safeParse(pet);
  const validatedPetId = petIdSchema.safeParse(petId);

  if (!validatedPet.success || !validatedPetId.success) {
    return {
      message: "Invalid pet data",
    };
  }

  // authorization
  const petCheck = await getPetById(validatedPetId.data);

  if (!petCheck) {
    return {
      message: "Pet not found",
    };
  }

  if (petCheck.userId !== session.user.id) {
    return {
      message: "Unauthorized",
    };
  }

  // database mutation
  try {
    await prisma.pet.update({
      where: {
        id: validatedPetId.data,
      },
      data: validatedPet.data,
    });
  } catch (error) {
    return {
      message: "Failed to edit pet",
    };
  }

  revalidatePath("/app", "layout");
};

export const deletePet = async (petId: unknown) => {
  // authentication
  const session = await checkAuth();

  // validation
  const validatedPetId = petIdSchema.safeParse(petId);

  if (!validatedPetId.success) {
    return {
      message: "Invalid pet ID",
    };
  }

  // authorization
  const pet = await getPetById(validatedPetId.data);

  if (!pet) {
    return {
      message: "Pet not found",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      message: "Unauthorized",
    };
  }

  // database mutation
  try {
    await prisma.pet.delete({
      where: {
        id: validatedPetId.data,
      },
    });
  } catch (error) {
    return {
      message: "Failed to delete pet",
    };
  }

  revalidatePath("/app", "layout");
};

// --- payment actions ---

export const createCheckoutSession = async () => {
  // authentication
  const session = await checkAuth();

  // create stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_KEY,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}/payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?cancelled=true`,
  });

  // redirect user
  redirect(checkoutSession.url);
};
