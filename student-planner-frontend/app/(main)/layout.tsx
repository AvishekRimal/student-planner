import ProtectedLayout from "@/components/layout/ProtectedLayout";

// This layout will apply to all pages inside the (main) group
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}