import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "./faq-data";
import { cn } from "@/lib/utils";

export function FaqList({ items, idPrefix = "faq", className, defaultOpenFirst = false }: { items: FaqItem[]; idPrefix?: string; className?: string; defaultOpenFirst?: boolean }) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpenFirst ? `${idPrefix}-0` : undefined} className={cn("rounded-2xl border bg-card px-5", className)}>
      {items.map((item, i) => (
        <AccordionItem key={item.q} value={`${idPrefix}-${i}`}>
          <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
