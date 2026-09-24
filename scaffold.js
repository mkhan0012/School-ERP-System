const fs = require('fs');
const path = require('path');

function write(filePath, content) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n');
}

// Layout & UI Components
write('src/components/ui/button.tsx', `
import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-600 text-white shadow hover:bg-blue-700": variant === 'default',
            "border border-gray-200 bg-white shadow-sm hover:bg-gray-100": variant === 'outline',
            "hover:bg-gray-100": variant === 'ghost',
            "bg-red-500 text-white shadow-sm hover:bg-red-600": variant === 'destructive',
            "h-9 px-4 py-2": size === 'default',
            "h-8 rounded-md px-3 text-xs": size === 'sm',
            "h-10 rounded-md px-8": size === 'lg',
            "h-9 w-9": size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
`);

write('src/components/ui/card.tsx', `
import * as React from "react"
import { cn } from "./button"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-gray-200 bg-white text-gray-950 shadow", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
`);

write('src/components/ui/input.tsx', `
import * as React from "react"
import { cn } from "./button"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
export { Input }
`);

write('src/components/ui/label.tsx', `
import * as React from "react"
import { cn } from "./button"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
))
Label.displayName = "Label"
export { Label }
`);

write('src/components/sidebar.tsx', `
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarCheck, BookOpen, BarChart3, Settings, LogOut, UserCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'

export function Sidebar() {
  return (
    <div className="w-64 border-r border-gray-200 bg-white h-screen flex flex-col fixed">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-700 tracking-tight">EDU-LEAD</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/leads" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Users size={20} /> Leads
        </Link>
        <Link href="/follow-ups" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <CalendarCheck size={20} /> Follow-ups
        </Link>
        <Link href="/counsellors" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <UserCircle size={20} /> Counsellors
        </Link>
        <Link href="/courses" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <BookOpen size={20} /> Courses
        </Link>
        <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <BarChart3 size={20} /> Reports
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Settings size={20} /> Settings
        </Link>
        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  )
}
`);

console.log("Scaffold complete");
