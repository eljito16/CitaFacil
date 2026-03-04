import React, { createContext, useState, ReactNode } from "react";

type UserType = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  photo: string;
};

type UserContextType = {
  user: UserType | null;
  saveUser: (data: UserType) => void;
  updateUser: (data: Partial<UserType>) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);

  const saveUser = (data: UserType) => {
    setUser(data);
  };

  const updateUser = (data: Partial<UserType>) => {
    if (!user) return;

    setUser({
      ...user,
      ...data,
    });
  };

  return (
    <UserContext.Provider value={{ user, saveUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}