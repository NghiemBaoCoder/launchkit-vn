"use client";
import * as React from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (ids: string[]) => void | Promise<void>;
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableList<T extends { id: string }>({ items, onReorder, renderItem, className, disabled }: SortableListProps<T>) {
  const [order, setOrder] = React.useState(items.map((i) => i.id));
  React.useEffect(() => setOrder(items.map((i) => i.id)), [items]);
  const dndId = React.useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const byId = new Map(items.map((i) => [i.id, i]));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
    setOrder(next);
    void onReorder(next);
  }

  return (
    <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          {order.map((id) => {
            const item = byId.get(id);
            if (!item) return null;
            return <SortableRow key={id} id={id} disabled={disabled}>{(handle) => renderItem(item, handle)}</SortableRow>;
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children, disabled }: { id: string; children: (handle: React.ReactNode) => React.ReactNode; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handle = (
    <button type="button" className={cn("flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground", disabled && "cursor-not-allowed opacity-40")} aria-label="Kéo để sắp xếp" {...attributes} {...listeners}>
      <GripVertical className="size-4" />
    </button>
  );
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-10 opacity-80 shadow-lg")}>
      {children(handle)}
    </div>
  );
}
