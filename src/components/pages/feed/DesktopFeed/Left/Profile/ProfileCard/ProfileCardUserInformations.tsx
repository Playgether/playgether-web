"use client";
import { useAuthContext } from "@/context/AuthContext";
import React from "react";

function ProfileCardUserInformations() {
  const { user } = useAuthContext();
  return (
    <>
      <h1 className="text-xl">
        {user?.first_name} {user?.last_name}
      </h1>
      <p className="mt-1 mb-3 text-xs ProfileCardInformation-username">
        {user?.username}
      </p>
    </>
  );
}

export default ProfileCardUserInformations;
