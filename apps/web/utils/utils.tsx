"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  callback: () => void;
}

export const Button = ({ children, className, callback }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={callback}
    >
      {children}
    </button>
  );
};
