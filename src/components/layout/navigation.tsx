"use client";
import { useAuth } from "@/contexts/auth-context";
import { UserRole } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Home, LucideIcon, PlusCircle, ScrollText, ShieldAlert, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Quest Board",
      href: "/quests",
      icon: ScrollText,
    },
    {
      title: "Create Quest",
      href: "/quests/create",
      icon: PlusCircle,
      roles: [UserRole.GuildCommander],
    },
    {
      title: "My Quests",
      href: "/quests/my-quests",
      icon: BookOpen,
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <nav className="flex flex-col justify-between h-screen border-r p-4 w-64">
      <div>
        <div className="flex items-center mb-8">
          <ShieldAlert className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-xl font-bold">Quest Tracker</h1>
        </div>
        <ul className="space-y-2">
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg hover:bg-secondary ${
                  pathname === item.href
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    {user.role === UserRole.Adventurer ? "A" : "GC"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {user.role === UserRole.Adventurer
                    ? "Adventurer"
                    : "Guild Commander"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
