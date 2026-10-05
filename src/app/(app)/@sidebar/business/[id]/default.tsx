import { BusinessSidebar } from "./sidebar";

export default async function BusinessSidebarDefault({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BusinessSidebar id={id} />;
}
