"use client";

// base imports
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// chakra ui imports
import { toaster, Toaster } from "@/app/components/ui/toaster";

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

export const ToastSignUp = () => {
  const params = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("message") === "SignUpSuccess") {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (show) {
      toaster.create({
        duration: 10000,
        title: "Account created successfully. Please login.",
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
