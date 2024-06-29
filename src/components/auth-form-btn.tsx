"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

type AuthFormBtnProps = {
  type: "login" | "signup";
};

const AuthFormBtn = ({ type }: AuthFormBtnProps) => {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {type === "login" ? "Log In" : "Sign Up"}
    </Button>
  );
};

export default AuthFormBtn;
