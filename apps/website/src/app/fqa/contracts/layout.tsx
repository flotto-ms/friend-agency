import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contracts | Flotto",
  description: "All the offers currantly available on flotto.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
