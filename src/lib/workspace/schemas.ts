import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Tên dịch vụ tối thiểu 2 ký tự").max(120),
  description: z.string().trim().max(1000),
  price: z.number().min(0, "Giá không hợp lệ"),
  sale_price: z.number().min(0).nullable(),
  unit: z.string().trim().max(40),
  delivery_time: z.string().trim().max(80),
  features: z.array(z.string().trim().min(1).max(200)).max(20),
  benefits: z.array(z.string().trim().min(1).max(200)).max(20),
  target_customer: z.string().trim().max(300),
  upsell: z.string().trim().max(300),
  active: z.boolean(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const packageSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên gói").max(80),
  description: z.string().trim().max(500),
  price: z.number().min(0, "Giá không hợp lệ"),
  billing_unit: z.string().trim().max(40),
  features: z.array(z.string().trim().min(1).max(200)).max(20),
  recommended: z.boolean(),
});
export type PackageInput = z.infer<typeof packageSchema>;

export const contentItemSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề").max(200),
  hook: z.string().trim().max(500),
  caption: z.string().trim().max(5000),
  cta: z.string().trim().max(300),
  platform: z.enum(["facebook", "tiktok", "instagram", "threads"]),
  content_type: z.string().trim().max(40),
  status: z.enum(["idea", "draft", "ready", "published"]),
  scheduled_date: z.string().nullable(),
});
export type ContentItemInput = z.infer<typeof contentItemSchema>;

export const documentSchema = z.object({
  title: z.string().trim().min(1, "Nhập tiêu đề").max(200),
  content: z.record(z.string(), z.unknown()),
});

export const businessSettingsSchema = z.object({
  name: z.string().trim().min(2, "Tên tối thiểu 2 ký tự").max(80),
  industry_id: z.string().uuid().nullable(),
  business_type_id: z.string().uuid().nullable(),
  currency: z.enum(["VND", "USD"]),
  location: z.string().trim().max(80),
  contact: z.object({
    email: z.string().trim().email("Email không hợp lệ").or(z.literal("")),
    phone: z.string().trim().max(20),
    address: z.string().trim().max(200),
    website: z.string().trim().max(200),
    facebook: z.string().trim().max(200),
    zalo: z.string().trim().max(50),
    instagram: z.string().trim().max(200),
    tiktok: z.string().trim().max(200),
  }),
});
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
