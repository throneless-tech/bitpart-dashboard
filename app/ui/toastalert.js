"use client"

// base imports
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react";

// chakra ui imports
import { toaster, Toaster } from "@/components/ui/toaster"

export const ToastAlert = () => {
  const params = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("message") === "SignOutSuccess") {
      setShow(true);
    }
  }, [])

  useEffect(() => {
    if (show) {
      toaster.create({
        duration: 5000,
        title: "You have successfully logged out",
        type: "success",
      })
    }
  }, [show])

  return (
    <>
      <Toaster toaster={toaster} />
    </>

  )
}