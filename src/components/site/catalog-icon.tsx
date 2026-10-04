import * as React from "react";
import {
  Apple,
  Baby,
  BookOpen,
  Building,
  Camera,
  ChefHat,
  Clapperboard,
  CodeXml,
  Coffee,
  Compass,
  Cpu,
  CupSoda,
  Dumbbell,
  Film,
  Flower2,
  Gift,
  GraduationCap,
  Hand,
  HeartPulse,
  Lamp,
  Languages,
  Laptop,
  Megaphone,
  Music,
  Palette,
  PawPrint,
  PenTool,
  Rocket,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkle,
  Sparkles,
  SprayCan,
  Truck,
  UtensilsCrossed,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Ánh xạ tên icon lưu trong DB (business_types.icon / industries.icon) sang component lucide.
 * Một số tên cũ (Building2, Code2) không còn trong lucide v1 nên được ánh xạ sang tên mới.
 */
const ICONS: Record<string, LucideIcon> = {
  Apple,
  Baby,
  BookOpen,
  Building,
  Building2: Building,
  Camera,
  ChefHat,
  Clapperboard,
  Code2: CodeXml,
  CodeXml,
  Coffee,
  Compass,
  Cpu,
  CupSoda,
  Dumbbell,
  Film,
  Flower2,
  Gift,
  GraduationCap,
  Hand,
  HeartPulse,
  Lamp,
  Languages,
  Laptop,
  Megaphone,
  Music,
  Palette,
  PawPrint,
  PenTool,
  Rocket,
  Scissors,
  Shirt,
  ShoppingBag,
  Sparkle,
  Sparkles,
  SprayCan,
  Truck,
  UtensilsCrossed,
  Wrench,
};

export function catalogIcon(name?: string | null): LucideIcon {
  if (name && ICONS[name]) return ICONS[name];
  return Sparkles;
}

export function CatalogIcon({ name, className }: { name?: string | null; className?: string }) {
  // Dùng createElement để tránh tạo component động trong render (react-hooks/static-components).
  return React.createElement(catalogIcon(name), { className, "aria-hidden": true });
}
