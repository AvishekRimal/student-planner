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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

export function UserNav() {
  const { user } = useAuth(); // Get the current user from the Redux store
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    // 1. Dispatch the logout action to Redux
    dispatch(logout());
    
    // 2. Delete the auth token cookie
    deleteCookie('token');
    
    // 3. Redirect to the login page
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {/* The AvatarImage can be used if you store profile picture URLs in the future */}
            {/* <AvatarImage src="/avatars/03.png" alt="@shadcn" /> */}
            <AvatarFallback>
              {/* Show the first letter of the username as a fallback */}
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
        {/* The logout action is triggered by clicking this menu item */}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
