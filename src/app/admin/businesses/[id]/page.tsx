import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, ExternalLink, FileJson, KeyRound, Layers, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { DetailList } from "@/components/admin/detail-list";
import { JsonView } from "@/components/admin/json-view";
import { StageList } from "@/components/admin/stage-list";
import { getBusinessDetail } from "@/lib/data/admin-businesses";
import { ENTITLEMENT_LABELS, type EntitlementKey } from "@/lib/access/policy";
import { WORKSPACE_SECTIONS } from "@/lib/constants";
import { formatDateTime, formatNumber, formatVND, timeAgo } from "@/lib/utils";

export const metadata = { title: "Chi tiết business" };

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(WORKSPACE_SECTIONS.map((s) => [s.key, s.label]));

export default async function AdminBusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getBusinessDetail(id);
  if (!detail) notFound();
  const { business, answers, answersUpdatedAt, assets, orders, entitlements, jobs, counts } = detail;

  const grouped = new Map<string, typeof assets>();
  for (const a of assets) {
    const list = grouped.get(a.category) ?? [];
    list.push(a);
    grouped.set(a.category, list);
  }
  const paidOrders = orders.filter((o) => o.status === "paid");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Link href="/admin/businesses" className="inline-flex items-center gap-1 hover:underline"><ArrowLeft className="size-3" /> Business</Link>}
        title={business.name}
        description={<span className="inline-flex flex-wrap items-center gap-2">/{business.slug} <StatusBadge kind="business" value={business.status} /></span>}
        actions={
          <Button asChild variant="outline"><Link href={`/business/${business.id}/overview`} target="_blank" rel="noreferrer"><ExternalLink /> Mở workspace</Link></Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Thông tin</CardTitle></CardHeader>
          <CardContent>
            <DetailList
              items={[
                { label: "Chủ sở hữu", value: business.profiles ? <Link href={`/admin/users/${business.profiles.id}`} className="hover:underline">{business.profiles.full_name || business.profiles.email}</Link> : "—" },
                { label: "Email", value: <span className="break-all">{business.profiles?.email ?? "—"}</span> },
                { label: "Loại hình", value: business.business_types?.name ?? "—" },
                { label: "Ngành", value: business.industries?.name ?? "—" },
                { label: "Địa điểm", value: business.location || "—" },
                { label: "Tiền tệ", value: business.currency },
                { label: "Onboarding", value: business.onboarding_completed ? <Badge variant="success">Hoàn tất</Badge> : <Badge variant="warning">Bước {business.onboarding_step}</Badge> },
                { label: "Tạo lúc", value: formatDateTime(business.created_at) },
                { label: "Sinh nội dung", value: business.generated_at ? formatDateTime(business.generated_at) : "Chưa" },
                { label: "Lưu trữ", value: business.archived_at ? formatDateTime(business.archived_at) : "—" },
                { label: "ID", value: <code className="font-mono text-[11px] text-muted-foreground">{business.id}</code> },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tổng quan nội dung</CardTitle>
            <CardDescription>Số lượng bản ghi đã sinh cho business này.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Asset", value: assets.length },
                { label: "Dịch vụ", value: counts.services },
                { label: "Nội dung", value: counts.content },
                { label: "Marketing", value: counts.marketing },
                { label: "Tài liệu", value: counts.documents },
                { label: "Generation", value: jobs.length },
              ].map((m) => (
                <div key={m.label} className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="text-xl font-bold tabular-nums">{formatNumber(m.value)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Website:</span>
              {counts.website ? (
                counts.website.is_published ? <Badge variant="success">Đã xuất bản · /{counts.website.slug}</Badge> : <Badge variant="secondary">Chưa xuất bản</Badge>
              ) : (
                <Badge variant="outline">Chưa tạo</Badge>
              )}
              <span className="ml-auto text-muted-foreground">Mua hàng:</span>
              {paidOrders.length ? <Badge variant="success">{paidOrders.length} đơn đã thanh toán</Badge> : <Badge variant="secondary">Chưa mua</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="assets">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="assets"><Layers /> Nội dung đã tạo</TabsTrigger>
              <TabsTrigger value="answers"><FileJson /> Câu trả lời</TabsTrigger>
              <TabsTrigger value="purchase"><ShoppingBag /> Mua hàng</TabsTrigger>
              <TabsTrigger value="jobs"><Cpu /> Lịch sử generation</TabsTrigger>
            </TabsList>

            <TabsContent value="assets">
              {assets.length === 0 ? (
                <EmptyState compact icon={Layers} title="Chưa có nội dung" description="Nội dung sẽ xuất hiện sau khi job generation hoàn tất." />
              ) : (
                <div className="space-y-5">
                  {Array.from(grouped.entries()).map(([category, list]) => (
                    <div key={category}>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{CATEGORY_LABEL[category] ?? category}</h3>
                        <Badge variant="secondary">{list.length}</Badge>
                      </div>
                      <Table>
                        <TableHeader><TableRow><TableHead>Tiêu đề</TableHead><TableHead>Key</TableHead><TableHead className="text-right">Phiên bản</TableHead><TableHead>Cập nhật</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {list.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium">{a.title}{a.is_premium ? <Badge variant="premium" className="ml-2">Premium</Badge> : null}</TableCell>
                              <TableCell><code className="text-xs text-muted-foreground">{a.key}</code></TableCell>
                              <TableCell className="text-right tabular-nums">v{a.version}</TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground" title={formatDateTime(a.updated_at)}>{timeAgo(a.updated_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="answers">
              {answers ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Cập nhật {formatDateTime(answersUpdatedAt)}</p>
                  <JsonView value={answers} maxHeight="max-h-[32rem]" />
                </div>
              ) : (
                <EmptyState compact icon={FileJson} title="Chưa có câu trả lời onboarding" />
              )}
            </TabsContent>

            <TabsContent value="purchase">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Đơn hàng cho business này</h3>
                  {orders.length === 0 ? (
                    <EmptyState compact icon={ShoppingBag} title="Chưa có đơn hàng" />
                  ) : (
                    <Table>
                      <TableHeader><TableRow><TableHead>Mã đơn</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Tổng</TableHead><TableHead>Ngày</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {orders.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.order_number}</Link></TableCell>
                            <TableCell>{o.products?.name ?? "—"}</TableCell>
                            <TableCell><StatusBadge kind="order" value={o.status} /></TableCell>
                            <TableCell className="text-right tabular-nums">{formatVND(o.total)}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.paid_at ?? o.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Quyền đã mở khoá (entitlements)</h3>
                  {entitlements.length === 0 ? (
                    <EmptyState compact icon={KeyRound} title="Chưa có quyền nào cho business này" description="Quyền cấp tài khoản (Pro Membership) xem ở trang người dùng." />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {entitlements.map((e) => (
                        <Badge key={e.id} variant={e.expires_at && new Date(e.expires_at) < new Date() ? "secondary" : "success"} title={`${e.source}${e.products?.name ? ` · ${e.products.name}` : ""} · ${formatDateTime(e.created_at)}`}>
                          {ENTITLEMENT_LABELS[e.key as EntitlementKey] ?? e.key}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jobs">
              {jobs.length === 0 ? (
                <EmptyState compact icon={Cpu} title="Chưa có phiên sinh nội dung" />
              ) : (
                <div className="space-y-3">
                  {jobs.map((j) => (
                    <div key={j.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="outline">{j.type === "full" ? "Toàn bộ kit" : j.type}</Badge>
                        <StatusBadge kind="job" value={j.status} />
                        <span className="text-muted-foreground">{j.provider}{j.model ? ` · ${j.model}` : ""}</span>
                        <span className="text-muted-foreground">· {j.credits_used} credits</span>
                        {j.duration_ms ? <span className="text-muted-foreground">· {(j.duration_ms / 1000).toFixed(1)}s</span> : null}
                        <span className="ml-auto text-xs text-muted-foreground" title={formatDateTime(j.created_at)}>{timeAgo(j.created_at)}</span>
                        <Link href={`/admin/generations?q=${j.id}`} className="text-xs text-primary hover:underline">Chi tiết</Link>
                      </div>
                      {j.error ? <p className="mt-1 text-xs text-destructive">{j.error}</p> : null}
                      <div className="mt-2"><StageList stages={j.stages} compact /></div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
