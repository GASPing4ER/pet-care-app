"use client";

import { login, signup } from "@/actions/actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import AuthFormBtn from "./auth-form-btn";
import { useFormState } from "react-dom";

type AuthFormProps = {
  type: "login" | "signup";
};

const AuthForm = ({ type }: AuthFormProps) => {
  const [signUpError, dispatchSignUp] = useFormState(signup, undefined);
  const [logInError, dispatchLogIn] = useFormState(login, undefined);

  return (
    <form action={type === "login" ? dispatchLogIn : dispatchSignUp}>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required maxLength={100} />
      </div>

      <div className="space-y-1 mb-4 mt-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          maxLength={100}
        />
      </div>

      <AuthFormBtn type={type} />
      {signUpError && (
        <p className="text-red-500 text-sm mt-2">{signUpError.message}</p>
      )}
      {logInError && (
        <p className="text-red-500 text-sm mt-2">{logInError.message}</p>
      )}
    </form>
  );
};

export default AuthForm;