import LenisProvider from "@/components/providers/LenisProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LenisProvider>{children}</LenisProvider>;
}
