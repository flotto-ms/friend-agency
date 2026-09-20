import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rates | Flotto",
  description: "Edit your rates",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
