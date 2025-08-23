"use client";

import { useAuth } from "@/redux/hooks/useAuth";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import { logout } from "@/redux/slices/authSlice";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle"; // Import the new ThemeToggle
import { LogOut, Settings } from 'lucide-react';
import Link from "next/link";

export function AppHeader() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    deleteCookie('token');
    router.push('/login');
  };

  return (
    // This is the main header bar
    <header className="flex h-16 items-center justify-end border-b bg-background px-4 md:px-8">
      {/* A container for our action buttons */}
      <div className="flex items-center gap-4 p-7">
        
        {/* The new theme toggle button */}
        <ThemeToggle />

        {/* The user avatar and dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}