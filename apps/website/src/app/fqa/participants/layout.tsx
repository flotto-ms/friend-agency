import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participants | Flotto",
  description: "Season Participants",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
