import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet | Flotto",
  description: "Manage your wallet and transactions",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
