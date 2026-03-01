"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Cookie,
  Frame,
  GalleryVerticalEnd,
  Map,
  Moon,
  PieChart,
  Plug2Icon,
  Settings2,
  SquareTerminal,
  Sun,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavProjects } from "./NavProjects";
import { NavUser } from "./NavUser";
import { ModeToggle } from "./ModeToggle";

// This is sample data.
const data = {
  user: {
    name: "Flotto Bot",
    email: "bot@flotto.vercel.app",
    avatar: "/icon.png",
  },
  navMain: [
    {
      title: "About",
      url: "/about",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/about",
        },
        {
          title: "Support",
          url: "/about/support",
        },
        {
          title: "Discord Server",
          icon: Bot,
          url: "/about/discord",
        },
        {
          title: "Browser Extension",
          icon: Plug2Icon,
          url: "/about/extension",
        },
      ],
    },
    {
      title: "Friend Quest Agency",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Quest Search",
          url: "/fqa/search",
        },
        {
          title: "Auction House",
          url: "/fqa/auctions",
        },
        {
          title: "Your Rates",
          url: "/fqa/rates",
        },
        {
          title: "Wallet",
          url: "/account/wallet",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Privacy Policy",
      url: "/legal/privacy-policy",
      icon: Cookie,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>Flotto Logo</SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
