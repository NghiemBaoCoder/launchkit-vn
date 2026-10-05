import { BusinessSidebar } from "./sidebar";

export default async function BusinessSidebarIndex({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessSidebar id={id} />;
}
