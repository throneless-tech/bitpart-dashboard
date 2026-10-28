"use client";

// base imports
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// chakra ui imports
import { toaster, Toaster } from "@/app/_components/ui/toaster";

export const ToastSignOut = () => {
  const params = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("message") === "SignOutSuccess") {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (show) {
      toaster.create({
        duration: 10000,
        title: "You have successfully logged out",
        type: "success",
      });
    }
  }, [show]);

  return (
    <>
      <Toaster toaster={toaster} />
    </>
  );
};

const loginMessages = {
  SignUpSuccess: "Account created successfully. Please login.",
  PasswordResetSuccess:
    "Your password has been reset. Please login with your new password.",
  PasswordChangeSuccess:
    "Your password has been changed and you've been logged out everywhere. Please login with your new password.",
};

export const ToastSignUp = () => {
  const params = useSearchParams();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setMessage(loginMessages[params.get("message")] ?? null);
  }, []);

  useEffect(() => {
    if (message) {
      toaster.create({
        duration: 10000,
        title: message,
        type: "success",
      });
    }
  }, [message]);

  return (
    <>
      <Toaster toaster={toaster} />
    </>
  );
};
