import { BusinessSidebar } from "../sidebar";

export default async function BusinessSidebarRest({ params }: { params: Promise<{ id: string; rest: string[] }> }) {
  const { id } = await params;
  return <BusinessSidebar id={id} />;
}
