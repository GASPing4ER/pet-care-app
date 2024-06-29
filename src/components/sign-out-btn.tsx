"use client";

import { logout } from "@/actions/actions";
import { Button } from "./ui/button";
import { useTransition } from "react";

const SignOutBtn = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logout();
        });
      }}
    >
      Sign out
    </Button>
  );
};

export default SignOutBtn;
