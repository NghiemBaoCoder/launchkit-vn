-- =====================================================================
-- Seed: catalog, products, settings, templates, coupons
-- (Người dùng mẫu được tạo bằng `pnpm seed:users`)
-- =====================================================================

insert into public.app_settings (key, value, is_public) values
('site', jsonb_build_object(
  'site_name', 'LaunchKit VN',
  'logo_url', null,
  'support_email', 'support@launchkit.vn',
  'default_currency', 'VND',
  'maintenance_mode', false,
  'registration_enabled', true,
  'referral_percentage', 10,
  'free_credits', 3,
  'purchase_credits', 20,
  'affiliate_auto_approve', true,
  'default_pricing', jsonb_build_object('business_kit', 299000, 'business_kit_pro', 599000, 'pro_membership', 199000)
), true),
('ai', jsonb_build_object(
  'provider', 'mock',
  'model', 'launchkit-mock-v1',
  'credits', jsonb_build_object('full', 1, 'section', 1, 'document', 1, 'content', 1),
  'free_limits', jsonb_build_object('max_businesses', 1, 'max_regenerations_per_day', 3),
  'timeout_ms', 60000,
  'stage_delay_ms', 600
), false)
on conflict (key) do update set value = excluded.value, is_public = excluded.is_public;

-- ---------- Business types ----------
insert into public.business_types (slug, name, description, icon, tagline, hero_title, hero_description, highlights, seo, sort_order) values
('freelancer', 'Freelancer', 'Làm việc tự do: thiết kế, lập trình, viết lách, marketing, dịch thuật…', 'Laptop', 'Biến kỹ năng thành dịch vụ có giá', 'Business Kit cho Freelancer', 'Định vị, bảng giá, kịch bản chốt deal và hợp đồng mẫu — để bạn nhận dự án tự tin và đúng giá.', '["Bảng giá 3 gói theo giờ/theo dự án", "Kịch bản tư vấn & xử lý từ chối", "Mẫu báo giá, hợp đồng, biên bản bàn giao", "Kế hoạch tìm khách 30 ngày"]', '{"title": "Business Kit cho Freelancer | LaunchKit VN", "description": "Tạo bộ khởi nghiệp hoàn chỉnh cho freelancer trong 10 phút: thương hiệu, bảng giá, kịch bản bán hàng, hợp đồng mẫu."}', 1),
('creator', 'Creator', 'Content creator, KOC/KOL, YouTuber, TikToker, podcaster', 'Clapperboard', 'Kiếm tiền bền vững từ cộng đồng', 'Business Kit cho Creator', 'Định vị kênh, gói hợp tác với nhãn hàng, media kit, lịch nội dung và kế hoạch kiếm tiền.', '["Media kit & bảng giá booking", "Lịch nội dung 30 ngày đa nền tảng", "Kịch bản pitch nhãn hàng", "Mẫu hợp đồng hợp tác"]', '{"title": "Business Kit cho Creator | LaunchKit VN"}', 2),
('salon', 'Salon & Spa', 'Tiệm tóc, nail, spa, mi, massage, chăm sóc da', 'Scissors', 'Kín lịch mỗi tuần', 'Business Kit cho Salon & Spa', 'Menu dịch vụ, combo, chương trình khách thân thiết, nội dung Facebook/TikTok và quy trình phục vụ chuẩn.', '["Menu dịch vụ & combo theo mùa", "Kịch bản tư vấn upsell", "Lịch nội dung TikTok/Facebook", "Checklist mở cửa – đóng cửa"]', '{"title": "Business Kit cho Salon & Spa | LaunchKit VN"}', 3),
('online-shop', 'Shop online', 'Bán hàng online trên Facebook, Shopee, TikTok Shop, Instagram', 'ShoppingBag', 'Bán nhiều hơn, chốt nhanh hơn', 'Business Kit cho Shop online', 'Định vị shop, chiến lược giá, kịch bản chốt đơn inbox, nội dung bán hàng và kế hoạch khuyến mãi.', '["Kịch bản inbox chốt đơn & chăm sóc", "Bảng giá & combo tối ưu lợi nhuận", "Lịch đăng 30 ngày", "Quy trình xử lý đơn và đổi trả"]', '{"title": "Business Kit cho Shop online | LaunchKit VN"}', 4),
('agency', 'Agency', 'Agency marketing, thiết kế, phát triển web, sản xuất nội dung', 'Building2', 'Chuyên nghiệp từ pitch đầu tiên', 'Business Kit cho Agency', 'Định vị dịch vụ, gói retainer, proposal mẫu, quy trình bán hàng B2B và kế hoạch marketing.', '["Gói dịch vụ retainer/dự án", "Proposal & hợp đồng dịch vụ", "Quy trình discovery – pitch – close", "Kế hoạch content B2B"]', '{"title": "Business Kit cho Agency | LaunchKit VN"}', 5),
('fnb', 'F&B nhỏ', 'Quán cà phê, trà sữa, quán ăn, bếp online, bánh handmade', 'Coffee', 'Mở quán có kế hoạch', 'Business Kit cho F&B nhỏ', 'Định vị quán, menu & giá vốn, kế hoạch khai trương, nội dung mạng xã hội và checklist vận hành hàng ngày.', '["Tính giá vốn & biên lợi nhuận", "Kế hoạch khai trương 30 ngày", "Checklist mở ca – đóng ca", "Nội dung TikTok/Facebook"]', '{"title": "Business Kit cho F&B nhỏ | LaunchKit VN"}', 6),
('coach', 'Coach & Giáo viên', 'Gia sư, coach, trung tâm nhỏ, khoá học online', 'GraduationCap', 'Lớp đầy, học viên quay lại', 'Business Kit cho Coach & Giáo viên', 'Chương trình học, gói học phí, kịch bản tư vấn phụ huynh/học viên, nội dung và quy trình chăm sóc.', '["Gói học phí & lộ trình", "Kịch bản tư vấn & xử lý từ chối", "Form tiếp nhận học viên", "Kế hoạch content chia sẻ kiến thức"]', '{"title": "Business Kit cho Coach & Giáo viên | LaunchKit VN"}', 7),
('local-service', 'Dịch vụ tại nhà', 'Sửa chữa, dọn dẹp, vận chuyển, chăm sóc thú cưng, điện lạnh', 'Wrench', 'Khách gọi là có mặt', 'Business Kit cho Dịch vụ tại nhà', 'Bảng giá minh bạch, kịch bản báo giá qua điện thoại, nội dung địa phương và quy trình phục vụ chuẩn.', '["Bảng giá minh bạch theo hạng mục", "Kịch bản báo giá qua Zalo/điện thoại", "Quy trình nhận – làm – bàn giao", "Nội dung marketing địa phương"]', '{"title": "Business Kit cho Dịch vụ tại nhà | LaunchKit VN"}', 8)
on conflict (slug) do nothing;

-- ---------- Industries ----------
with bt as (select id, slug from public.business_types)
insert into public.industries (slug, name, description, icon, business_type_id, sort_order)
select v.slug, v.name, v.description, v.icon, bt.id, v.sort_order
from (values
  ('website-development', 'Phát triển website', 'Thiết kế & lập trình website, landing page, web app', 'Code2', 'freelancer', 1),
  ('graphic-design', 'Thiết kế đồ hoạ', 'Logo, bộ nhận diện, ấn phẩm, social media design', 'Palette', 'freelancer', 2),
  ('copywriting', 'Viết nội dung', 'Copywriting, content marketing, SEO content, biên tập', 'PenTool', 'freelancer', 3),
  ('digital-marketing', 'Digital marketing', 'Chạy quảng cáo, SEO, social media, email marketing', 'Megaphone', 'freelancer', 4),
  ('video-editing', 'Dựng video', 'Edit video, motion graphics, TikTok/YouTube', 'Film', 'freelancer', 5),
  ('translation', 'Dịch thuật', 'Dịch tài liệu, phiên dịch, bản địa hoá', 'Languages', 'freelancer', 6),
  ('photography', 'Nhiếp ảnh', 'Chụp sản phẩm, sự kiện, chân dung, cưới', 'Camera', 'freelancer', 7),
  ('lifestyle-creator', 'Lifestyle & Vlog', 'Nội dung đời sống, du lịch, ăn uống', 'Sparkles', 'creator', 1),
  ('beauty-creator', 'Beauty & Fashion', 'Làm đẹp, thời trang, review mỹ phẩm', 'Sparkle', 'creator', 2),
  ('education-creator', 'Giáo dục & Kiến thức', 'Chia sẻ kiến thức, tài chính cá nhân, kỹ năng', 'BookOpen', 'creator', 3),
  ('tech-creator', 'Công nghệ & Review', 'Review thiết bị, phần mềm, AI', 'Cpu', 'creator', 4),
  ('food-creator', 'Ẩm thực', 'Nấu ăn, review quán, mukbang', 'UtensilsCrossed', 'creator', 5),
  ('hair-salon', 'Salon tóc', 'Cắt, uốn, nhuộm, phục hồi tóc', 'Scissors', 'salon', 1),
  ('nail-salon', 'Nail & Mi', 'Nail art, nối mi, uốn mi', 'Hand', 'salon', 2),
  ('spa-skincare', 'Spa & Chăm sóc da', 'Chăm sóc da, trị mụn, massage mặt', 'Flower2', 'salon', 3),
  ('massage-wellness', 'Massage & Wellness', 'Massage trị liệu, xông hơi, thư giãn', 'HeartPulse', 'salon', 4),
  ('fashion-shop', 'Thời trang', 'Quần áo, phụ kiện, giày dép', 'Shirt', 'online-shop', 1),
  ('cosmetics-shop', 'Mỹ phẩm', 'Mỹ phẩm, skincare, nước hoa', 'SprayCan', 'online-shop', 2),
  ('home-decor-shop', 'Đồ gia dụng & Decor', 'Đồ gia dụng, trang trí nhà cửa', 'Lamp', 'online-shop', 3),
  ('mom-baby-shop', 'Mẹ & Bé', 'Đồ dùng cho mẹ và bé', 'Baby', 'online-shop', 4),
  ('handmade-shop', 'Handmade & Quà tặng', 'Sản phẩm thủ công, quà tặng cá nhân hoá', 'Gift', 'online-shop', 5),
  ('food-shop', 'Thực phẩm & Đặc sản', 'Đặc sản vùng miền, thực phẩm sạch', 'Apple', 'online-shop', 6),
  ('marketing-agency', 'Marketing agency', 'Dịch vụ marketing trọn gói, performance, branding', 'Rocket', 'agency', 1),
  ('web-agency', 'Web & Software agency', 'Phát triển website, ứng dụng, phần mềm theo yêu cầu', 'Code2', 'agency', 2),
  ('design-studio', 'Design studio', 'Branding, packaging, UI/UX', 'PenTool', 'agency', 3),
  ('content-production', 'Sản xuất nội dung', 'Video, ảnh, content studio', 'Clapperboard', 'agency', 4),
  ('coffee-shop', 'Quán cà phê', 'Cà phê, trà, bánh', 'Coffee', 'fnb', 1),
  ('milk-tea', 'Trà sữa & Đồ uống', 'Trà sữa, nước ép, đồ uống take-away', 'CupSoda', 'fnb', 2),
  ('home-kitchen', 'Bếp online', 'Đồ ăn đặt trước, cơm văn phòng, bánh handmade', 'ChefHat', 'fnb', 3),
  ('restaurant-small', 'Quán ăn nhỏ', 'Quán ăn gia đình, ăn vặt, đặc sản', 'UtensilsCrossed', 'fnb', 4),
  ('english-tutor', 'Dạy tiếng Anh', 'Gia sư, lớp nhỏ, luyện IELTS/TOEIC', 'Languages', 'coach', 1),
  ('life-career-coach', 'Life & Career coach', 'Coaching cá nhân, sự nghiệp, kỹ năng', 'Compass', 'coach', 2),
  ('fitness-coach', 'Fitness & Yoga', 'PT cá nhân, yoga, dinh dưỡng', 'Dumbbell', 'coach', 3),
  ('music-art-class', 'Lớp nhạc & Mỹ thuật', 'Dạy đàn, vẽ, năng khiếu', 'Music', 'coach', 4),
  ('home-cleaning', 'Dọn dẹp nhà cửa', 'Vệ sinh nhà, văn phòng, sofa, máy lạnh', 'SprayCan', 'local-service', 1),
  ('repair-service', 'Sửa chữa & Điện lạnh', 'Sửa điện nước, máy lạnh, máy giặt', 'Wrench', 'local-service', 2),
  ('pet-care', 'Chăm sóc thú cưng', 'Spa thú cưng, trông giữ, dắt chó', 'PawPrint', 'local-service', 3),
  ('moving-delivery', 'Vận chuyển & Giao hàng', 'Chuyển nhà, giao hàng nội thành', 'Truck', 'local-service', 4)
) as v(slug, name, description, icon, bt_slug, sort_order)
join bt on bt.slug = v.bt_slug
on conflict (slug) do nothing;

-- ---------- Products ----------
insert into public.products (slug, name, description, kind, price, sale_price, billing_interval, features, entitlements, entitlement_scope, credits, active, recommended, sort_order) values
('free', 'Miễn phí', 'Trải nghiệm Business Kit với bản xem trước cơ bản.', 'free', 0, null, null,
  '["1 business", "Thương hiệu & dịch vụ cơ bản", "Bảng giá cơ bản", "3 credits tạo nội dung", "Máy tính tài chính cơ bản"]',
  '{}', 'account', 0, true, false, 0),
('business-kit', 'Business Kit', 'Bộ khởi nghiệp đầy đủ cho một business: thương hiệu, bảng giá, bán hàng, marketing, nội dung, vận hành, tài liệu.', 'one_time', 499000, 299000, null,
  '["Toàn bộ nội dung thương hiệu & định vị", "Bảng giá 3 gói + máy tính biên lợi nhuận", "Kịch bản bán hàng, xử lý từ chối, follow-up", "Kế hoạch marketing 30 ngày", "30 nội dung đa nền tảng", "Checklist vận hành & quy trình", "6 mẫu tài liệu (báo giá, hợp đồng, hoá đơn…)", "Xuất PDF/CSV/Markdown"]',
  '{brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic}', 'business', 10, true, true, 1),
('business-kit-pro', 'Business Kit Pro', 'Tất cả trong Business Kit cộng Website Kit, tạo lại nội dung không giới hạn và xuất bản cao cấp.', 'one_time', 899000, 599000, null,
  '["Mọi thứ trong Business Kit", "Website Kit: studio dựng website & trang public", "Tạo lại nội dung từng mục", "Xuất bản cao cấp (ZIP trọn bộ)", "+20 credits"]',
  '{brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic,website_kit,premium_exports,regeneration}', 'business', 20, true, false, 2),
('pro-membership', 'Pro Membership', 'Dành cho người làm nhiều dự án: không giới hạn business, credits hàng tháng, template cao cấp.', 'subscription', 199000, null, 'month',
  '["Nhiều business cùng lúc", "50 credits mỗi tháng", "Mở khoá toàn bộ kit cho mọi business", "Website Kit cho mọi business", "Template & generator cao cấp"]',
  '{multiple_businesses,regeneration,premium_templates,advanced_generators,premium_exports,brand_full,services_full,pricing_full,sales_full,marketing_full,content_30,operations_full,documents_full,exports_basic,website_kit}', 'account', 50, true, false, 3)
on conflict (slug) do update set name = excluded.name, description = excluded.description, price = excluded.price, sale_price = excluded.sale_price, features = excluded.features, entitlements = excluded.entitlements, credits = excluded.credits;

-- ---------- Coupons ----------
insert into public.coupons (code, description, type, value, max_discount, min_order, usage_limit, per_user_limit, active, applicable_product_ids) values
('DEMO50', 'Giảm 50% cho đơn đầu tiên (demo)', 'percentage', 50, 300000, 0, 1000, 1, true, '{}'),
('LAUNCH100K', 'Giảm 100.000đ cho Business Kit', 'fixed', 100000, null, 299000, 500, 1, true, '{}'),
('FREEKIT', 'Miễn phí 100% — dùng để kiểm thử', 'percentage', 100, null, 0, 50, 1, true, '{}')
on conflict (code) do nothing;

-- ---------- Templates ----------
insert into public.templates (name, category, config, active, version) values
('Thương hiệu — chuẩn', 'brand', '{"tone": "gần gũi, tự tin", "structure": ["positioning", "value_proposition", "tagline", "description", "voice", "persona", "key_messages", "palette", "typography"], "hints": {"tagline_max_words": 8}}', true, 1),
('Bảng giá — 3 gói', 'pricing', '{"tiers": ["basic", "standard", "premium"], "multipliers": [1, 1.8, 3.2], "margin_target": 0.45}', true, 1),
('Bán hàng — tư vấn & chốt', 'sales', '{"structure": ["elevator_pitch", "short_message", "long_message", "consultation_script", "discovery_questions", "objections", "follow_up", "closing"], "objection_count": 6}', true, 1),
('Marketing — 30 ngày', 'marketing', '{"plan_days": 30, "channels": ["facebook", "tiktok", "instagram", "zalo", "google"], "campaign_count": 5}', true, 1),
('Nội dung — đa nền tảng', 'content', '{"items": 30, "platforms": ["facebook", "tiktok", "instagram", "threads"], "mix": {"educational": 0.4, "social_proof": 0.2, "promotion": 0.2, "behind_the_scenes": 0.2}}', true, 1),
('Website — landing 12 section', 'website', '{"sections": ["hero", "about", "problem", "solution", "services", "benefits", "pricing", "social_proof", "faq", "cta", "contact", "footer"]}', true, 1),
('Vận hành — checklist', 'operations', '{"checklists": ["launch", "daily", "weekly", "customer_workflow", "sales_workflow", "delivery_workflow"]}', true, 1),
('Tài liệu — bộ 6 mẫu', 'documents', '{"types": ["quotation", "proposal", "service_agreement", "client_brief", "invoice", "intake_form"]}', true, 1);
