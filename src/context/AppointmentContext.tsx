import React, { createContext, useState, ReactNode } from "react";

export type Appointment = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  time: string;
  paymentMethod: "efectivo" | "transferencia";
  store: string;
};

type AppointmentContextType = {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
};

export const AppointmentContext =
  createContext<AppointmentContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AppointmentProvider = ({ children }: Props) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const addAppointment = (appointment: Appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  return (
    <AppointmentContext.Provider value={{ appointments, addAppointment }}>
      {children}
    </AppointmentContext.Provider>
  );
};