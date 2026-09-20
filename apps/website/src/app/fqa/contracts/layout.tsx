import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contracts | Flotto",
  description: "Active contracts",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
