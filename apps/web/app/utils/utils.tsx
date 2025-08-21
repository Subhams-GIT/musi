import React, { useState, useEffect, useRef } from "react";

export interface Track {
  id: string;
  type: "Youtube" | "Spotify",
  title: string;
  artist: string;
  duration: string;
  url: string;
  upvotes: number;
  active?: boolean;
  smallThumbnail?: string;
  largeThumbnail?: string;
  userVote?: "up" | "down" | null;
  addedBy?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Custom Input Component
export function Input({
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

// Custom Card Component
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

export  function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

// Custom Badge Component
export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive";
  className?: string;
}) {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Custom Avatar Component
export function Avatar({
  src,
  alt,
  fallback,
  className = "",
}: {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src || "/next.svg"}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-600">
          {fallback}
        </div>
      )}
    </div>
  );
}

// Custom Slider Component
export function Slider({
  value,
  onValueChange,
  max = 100,
  step = 1,
  className = "",
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  step?: number;
  className?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseInt(e.target.value)]);
  };

  return (
    <input
      type="range"
      min="0"
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
    />
  );
}

// Custom Tabs Component
export function Tabs({
  defaultValue,
  children,
  className = "",
}: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={`${className}`} data-active-tab={activeTab}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {activeTab, setActiveTab} as any)
          : child
      )}
    </div>
  );
}

export function TabsList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  activeTab,
  setActiveTab,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (value: string) => void;
  className?: string;
}) {
  const isActive = activeTab === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-500 hover:text-gray-900"
      } ${className}`}
      onClick={() => setActiveTab?.(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  activeTab,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  className?: string;
}) {
  if (activeTab !== value) return null;

  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  );
}

// Custom ScrollArea Component
export function ScrollArea({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`overflow-auto ${className}`}>{children}</div>;
}

// Custom Dropdown Menu Component
export function DropdownMenu({children}: {children: React.ReactNode}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {isOpen, setIsOpen} as any)
          : child
      )}
    </div>
  );
}

export function DropdownMenuTrigger({
  children,
  isOpen,
  setIsOpen,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}) {
  return <div onClick={() => setIsOpen?.(!isOpen)}>{children}</div>;
}

export function DropdownMenuContent({
  children,
  isOpen,
  align = "start",
  className = "",
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  align?: "start" | "end";
  className?: string;
}) {
  if (!isOpen) return null;

  const alignmentClasses = align === "end" ? "right-0" : "left-0";

  return (
    <div
      className={`absolute top-full mt-1 ${alignmentClasses} z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}