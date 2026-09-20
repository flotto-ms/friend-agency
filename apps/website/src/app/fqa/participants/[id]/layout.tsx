import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Participant Details | Flotto",
  description: "Details of season participant",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
