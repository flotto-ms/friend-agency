import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract History | Flotto",
  description: "Contract history",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
