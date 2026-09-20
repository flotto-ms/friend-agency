import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Flotto",
  description: "Search for quests and contractors",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
