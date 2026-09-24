import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offer History | Flotto",
  description: "View the history of this offer",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
