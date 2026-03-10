"use client";

import React, { createContext, useContext, useState } from "react";

interface CreatePostContextValue {
  createPostOpen: boolean;
  handleCreatePostModal: (open: boolean) => void;
}

const CreatePostContext = createContext<CreatePostContextValue | undefined>(
  undefined
);

export function useCreatePostContext() {
  const context = useContext(CreatePostContext);
  return context;
}

export function CreatePostProvider({ children }: { children: React.ReactNode }) {
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const handleCreatePostModal = (open: boolean) => {
    setCreatePostOpen(open);
  };

  return (
    <CreatePostContext.Provider
      value={{ createPostOpen, handleCreatePostModal }}
    >
      {children}
    </CreatePostContext.Provider>
  );
}
