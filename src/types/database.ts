
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "activity_logs": {
                  Row: {
                    "action": string,"business_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string | null,"id": string,"metadata": NonNullable<Json>,"title": string | null,"user_id": string | null
                  }
                  Insert: {
                    "action": string,"business_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"title"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"business_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string | null,"id"?: string,"metadata"?: NonNullable<Json>,"title"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "activity_logs_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "activity_logs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"affiliates": {
                  Row: {
                    "clicks": number,"code": string,"commission_rate": number,"created_at": string,"id": string,"notes": string | null,"status": Database["public"]['Enums']["affiliate_status"],"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "clicks"?: number,"code": string,"commission_rate"?: number,"created_at"?: string,"id"?: string,"notes"?: string | null,"status"?: Database["public"]['Enums']["affiliate_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "clicks"?: number,"code"?: string,"commission_rate"?: number,"created_at"?: string,"id"?: string,"notes"?: string | null,"status"?: Database["public"]['Enums']["affiliate_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "affiliates_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"analytics_events": {
                  Row: {
                    "anon_id": string | null,"created_at": string,"event": string,"id": string,"path": string | null,"properties": NonNullable<Json>,"source": string | null,"user_id": string | null
                  }
                  Insert: {
                    "anon_id"?: string | null,"created_at"?: string,"event": string,"id"?: string,"path"?: string | null,"properties"?: NonNullable<Json>,"source"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "anon_id"?: string | null,"created_at"?: string,"event"?: string,"id"?: string,"path"?: string | null,"properties"?: NonNullable<Json>,"source"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "analytics_events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"app_settings": {
                  Row: {
                    "is_public": boolean,"key": string,"updated_at": string,"updated_by": string | null,"value": NonNullable<Json>
                  }
                  Insert: {
                    "is_public"?: boolean,"key": string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Update: {
                    "is_public"?: boolean,"key"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "app_settings_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"after_data": Json | null,"before_data": Json | null,"created_at": string,"id": string,"metadata": NonNullable<Json>,"target_id": string | null,"target_type": string | null
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after_data"?: Json | null,"before_data"?: Json | null,"created_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"target_id"?: string | null,"target_type"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after_data"?: Json | null,"before_data"?: Json | null,"created_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"target_id"?: string | null,"target_type"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"business_answers": {
                  Row: {
                    "answers": NonNullable<Json>,"business_id": string,"updated_at": string
                  }
                  Insert: {
                    "answers"?: NonNullable<Json>,"business_id": string,"updated_at"?: string
                  }
                  Update: {
                    "answers"?: NonNullable<Json>,"business_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "business_answers_business_id_fkey"
      columns: ["business_id"]
isOneToOne: true
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"business_asset_versions": {
                  Row: {
                    "asset_id": string,"business_id": string,"content": NonNullable<Json>,"created_at": string,"created_by": string | null,"id": string,"source": string,"version": number
                  }
                  Insert: {
                    "asset_id": string,"business_id": string,"content": NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"id"?: string,"source"?: string,"version": number
                  }
                  Update: {
                    "asset_id"?: string,"business_id"?: string,"content"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"id"?: string,"source"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "business_asset_versions_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "business_assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "business_asset_versions_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "business_asset_versions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"business_assets": {
                  Row: {
                    "business_id": string,"category": Database["public"]['Enums']["asset_category"],"content": NonNullable<Json>,"created_at": string,"id": string,"is_premium": boolean,"key": string,"title": string,"updated_at": string,"version": number
                  }
                  Insert: {
                    "business_id": string,"category": Database["public"]['Enums']["asset_category"],"content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"is_premium"?: boolean,"key": string,"title": string,"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "business_id"?: string,"category"?: Database["public"]['Enums']["asset_category"],"content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"is_premium"?: boolean,"key"?: string,"title"?: string,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "business_assets_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"business_types": {
                  Row: {
                    "active": boolean,"created_at": string,"description": string | null,"hero_description": string | null,"hero_title": string | null,"highlights": NonNullable<Json>,"icon": string | null,"id": string,"name": string,"seo": NonNullable<Json>,"slug": string,"sort_order": number,"tagline": string | null,"updated_at": string
                  }
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"hero_description"?: string | null,"hero_title"?: string | null,"highlights"?: NonNullable<Json>,"icon"?: string | null,"id"?: string,"name": string,"seo"?: NonNullable<Json>,"slug": string,"sort_order"?: number,"tagline"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"hero_description"?: string | null,"hero_title"?: string | null,"highlights"?: NonNullable<Json>,"icon"?: string | null,"id"?: string,"name"?: string,"seo"?: NonNullable<Json>,"slug"?: string,"sort_order"?: number,"tagline"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"businesses": {
                  Row: {
                    "archived_at": string | null,"business_type_id": string | null,"contact": NonNullable<Json>,"created_at": string,"currency": string,"generated_at": string | null,"id": string,"industry_id": string | null,"location": string | null,"logo_url": string | null,"name": string,"onboarding_completed": boolean,"onboarding_step": number,"slug": string,"status": Database["public"]['Enums']["business_status"],"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "archived_at"?: string | null,"business_type_id"?: string | null,"contact"?: NonNullable<Json>,"created_at"?: string,"currency"?: string,"generated_at"?: string | null,"id"?: string,"industry_id"?: string | null,"location"?: string | null,"logo_url"?: string | null,"name": string,"onboarding_completed"?: boolean,"onboarding_step"?: number,"slug": string,"status"?: Database["public"]['Enums']["business_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "archived_at"?: string | null,"business_type_id"?: string | null,"contact"?: NonNullable<Json>,"created_at"?: string,"currency"?: string,"generated_at"?: string | null,"id"?: string,"industry_id"?: string | null,"location"?: string | null,"logo_url"?: string | null,"name"?: string,"onboarding_completed"?: boolean,"onboarding_step"?: number,"slug"?: string,"status"?: Database["public"]['Enums']["business_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "businesses_business_type_id_fkey"
      columns: ["business_type_id"]
isOneToOne: false
      referencedRelation: "business_types"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "businesses_industry_id_fkey"
      columns: ["industry_id"]
isOneToOne: false
      referencedRelation: "industries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "businesses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"checklist_items": {
                  Row: {
                    "business_id": string,"checklist_id": string,"created_at": string,"description": string | null,"done": boolean,"id": string,"sort_order": number,"title": string,"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"checklist_id": string,"created_at"?: string,"description"?: string | null,"done"?: boolean,"id"?: string,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"checklist_id"?: string,"created_at"?: string,"description"?: string | null,"done"?: boolean,"id"?: string,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checklist_items_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checklist_items_checklist_id_fkey"
      columns: ["checklist_id"]
isOneToOne: false
      referencedRelation: "checklists"
      referencedColumns: ["id"]
    }
                  ]
                },"checklists": {
                  Row: {
                    "business_id": string,"created_at": string,"description": string | null,"id": string,"kind": Database["public"]['Enums']["checklist_kind"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["checklist_kind"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["checklist_kind"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checklists_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"commissions": {
                  Row: {
                    "affiliate_id": string,"amount": number,"created_at": string,"id": string,"order_id": string,"paid_at": string | null,"rate": number,"status": Database["public"]['Enums']["commission_status"],"updated_at": string
                  }
                  Insert: {
                    "affiliate_id": string,"amount"?: number,"created_at"?: string,"id"?: string,"order_id": string,"paid_at"?: string | null,"rate"?: number,"status"?: Database["public"]['Enums']["commission_status"],"updated_at"?: string
                  }
                  Update: {
                    "affiliate_id"?: string,"amount"?: number,"created_at"?: string,"id"?: string,"order_id"?: string,"paid_at"?: string | null,"rate"?: number,"status"?: Database["public"]['Enums']["commission_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "commissions_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "commissions_order_id_fkey"
      columns: ["order_id"]
isOneToOne: true
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"contact_messages": {
                  Row: {
                    "admin_note": string | null,"created_at": string,"email": string,"handled_at": string | null,"handled_by": string | null,"id": string,"message": string,"name": string,"status": Database["public"]['Enums']["contact_status"],"topic": string,"updated_at": string,"user_id": string | null
                  }
                  Insert: {
                    "admin_note"?: string | null,"created_at"?: string,"email": string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"message": string,"name": string,"status"?: Database["public"]['Enums']["contact_status"],"topic"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "admin_note"?: string | null,"created_at"?: string,"email"?: string,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"message"?: string,"name"?: string,"status"?: Database["public"]['Enums']["contact_status"],"topic"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "contact_messages_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "contact_messages_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"content_items": {
                  Row: {
                    "business_id": string,"caption": string | null,"content_type": string,"created_at": string,"cta": string | null,"hook": string | null,"id": string,"platform": Database["public"]['Enums']["content_platform"],"published_at": string | null,"scheduled_date": string | null,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"caption"?: string | null,"content_type"?: string,"created_at"?: string,"cta"?: string | null,"hook"?: string | null,"id"?: string,"platform"?: Database["public"]['Enums']["content_platform"],"published_at"?: string | null,"scheduled_date"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"caption"?: string | null,"content_type"?: string,"created_at"?: string,"cta"?: string | null,"hook"?: string | null,"id"?: string,"platform"?: Database["public"]['Enums']["content_platform"],"published_at"?: string | null,"scheduled_date"?: string | null,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "content_items_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"coupon_redemptions": {
                  Row: {
                    "coupon_id": string,"created_at": string,"id": string,"order_id": string,"user_id": string
                  }
                  Insert: {
                    "coupon_id": string,"created_at"?: string,"id"?: string,"order_id": string,"user_id": string
                  }
                  Update: {
                    "coupon_id"?: string,"created_at"?: string,"id"?: string,"order_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupon_redemptions_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coupon_redemptions_order_id_fkey"
      columns: ["order_id"]
isOneToOne: true
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coupon_redemptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"coupons": {
                  Row: {
                    "active": boolean,"applicable_product_ids": (string)[],"code": string,"created_at": string,"created_by": string | null,"description": string | null,"expires_at": string | null,"id": string,"max_discount": number | null,"min_order": number,"per_user_limit": number,"starts_at": string | null,"type": Database["public"]['Enums']["coupon_type"],"updated_at": string,"usage_limit": number | null,"used_count": number,"value": number
                  }
                  Insert: {
                    "active"?: boolean,"applicable_product_ids"?: (string)[],"code": string,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"expires_at"?: string | null,"id"?: string,"max_discount"?: number | null,"min_order"?: number,"per_user_limit"?: number,"starts_at"?: string | null,"type": Database["public"]['Enums']["coupon_type"],"updated_at"?: string,"usage_limit"?: number | null,"used_count"?: number,"value": number
                  }
                  Update: {
                    "active"?: boolean,"applicable_product_ids"?: (string)[],"code"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"expires_at"?: string | null,"id"?: string,"max_discount"?: number | null,"min_order"?: number,"per_user_limit"?: number,"starts_at"?: string | null,"type"?: Database["public"]['Enums']["coupon_type"],"updated_at"?: string,"usage_limit"?: number | null,"used_count"?: number,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupons_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"credit_transactions": {
                  Row: {
                    "amount": number,"balance_after": number,"created_at": string,"created_by": string | null,"id": string,"reason": string,"ref_id": string | null,"ref_type": string | null,"user_id": string
                  }
                  Insert: {
                    "amount": number,"balance_after": number,"created_at"?: string,"created_by"?: string | null,"id"?: string,"reason": string,"ref_id"?: string | null,"ref_type"?: string | null,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"balance_after"?: number,"created_at"?: string,"created_by"?: string | null,"id"?: string,"reason"?: string,"ref_id"?: string | null,"ref_type"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "credit_transactions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "credit_transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"documents": {
                  Row: {
                    "business_id": string,"content": NonNullable<Json>,"created_at": string,"id": string,"title": string,"type": Database["public"]['Enums']["document_type"],"updated_at": string,"version": number
                  }
                  Insert: {
                    "business_id": string,"content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"title": string,"type": Database["public"]['Enums']["document_type"],"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "business_id"?: string,"content"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"title"?: string,"type"?: Database["public"]['Enums']["document_type"],"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"downloads": {
                  Row: {
                    "business_id": string | null,"created_at": string,"export_id": string | null,"file_name": string | null,"id": string,"user_id": string
                  }
                  Insert: {
                    "business_id"?: string | null,"created_at"?: string,"export_id"?: string | null,"file_name"?: string | null,"id"?: string,"user_id": string
                  }
                  Update: {
                    "business_id"?: string | null,"created_at"?: string,"export_id"?: string | null,"file_name"?: string | null,"id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "downloads_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "downloads_export_id_fkey"
      columns: ["export_id"]
isOneToOne: false
      referencedRelation: "exports"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "downloads_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"entitlements": {
                  Row: {
                    "business_id": string | null,"created_at": string,"expires_at": string | null,"id": string,"key": string,"order_id": string | null,"product_id": string | null,"source": string,"user_id": string
                  }
                  Insert: {
                    "business_id"?: string | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"key": string,"order_id"?: string | null,"product_id"?: string | null,"source"?: string,"user_id": string
                  }
                  Update: {
                    "business_id"?: string | null,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"key"?: string,"order_id"?: string | null,"product_id"?: string | null,"source"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "entitlements_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "entitlements_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "entitlements_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "entitlements_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"exports": {
                  Row: {
                    "business_id": string,"completed_at": string | null,"created_at": string,"error": string | null,"file_path": string | null,"file_size": number | null,"format": Database["public"]['Enums']["export_format"],"id": string,"items": NonNullable<Json>,"kind": string,"status": Database["public"]['Enums']["export_status"],"title": string,"user_id": string
                  }
                  Insert: {
                    "business_id": string,"completed_at"?: string | null,"created_at"?: string,"error"?: string | null,"file_path"?: string | null,"file_size"?: number | null,"format": Database["public"]['Enums']["export_format"],"id"?: string,"items"?: NonNullable<Json>,"kind"?: string,"status"?: Database["public"]['Enums']["export_status"],"title": string,"user_id": string
                  }
                  Update: {
                    "business_id"?: string,"completed_at"?: string | null,"created_at"?: string,"error"?: string | null,"file_path"?: string | null,"file_size"?: number | null,"format"?: Database["public"]['Enums']["export_format"],"id"?: string,"items"?: NonNullable<Json>,"kind"?: string,"status"?: Database["public"]['Enums']["export_status"],"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "exports_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "exports_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"finance_calculations": {
                  Row: {
                    "business_id": string,"created_at": string,"data": NonNullable<Json>,"id": string,"type": Database["public"]['Enums']["finance_calc_type"],"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"type": Database["public"]['Enums']["finance_calc_type"],"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"type"?: Database["public"]['Enums']["finance_calc_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "finance_calculations_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"generation_jobs": {
                  Row: {
                    "attempts": number,"business_id": string,"completed_at": string | null,"created_at": string,"credits_used": number,"current_stage": string | null,"duration_ms": number | null,"error": string | null,"id": string,"model": string | null,"provider": string,"stages": NonNullable<Json>,"started_at": string | null,"status": Database["public"]['Enums']["job_status"],"type": string,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "attempts"?: number,"business_id": string,"completed_at"?: string | null,"created_at"?: string,"credits_used"?: number,"current_stage"?: string | null,"duration_ms"?: number | null,"error"?: string | null,"id"?: string,"model"?: string | null,"provider"?: string,"stages"?: NonNullable<Json>,"started_at"?: string | null,"status"?: Database["public"]['Enums']["job_status"],"type"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "attempts"?: number,"business_id"?: string,"completed_at"?: string | null,"created_at"?: string,"credits_used"?: number,"current_stage"?: string | null,"duration_ms"?: number | null,"error"?: string | null,"id"?: string,"model"?: string | null,"provider"?: string,"stages"?: NonNullable<Json>,"started_at"?: string | null,"status"?: Database["public"]['Enums']["job_status"],"type"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "generation_jobs_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "generation_jobs_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"industries": {
                  Row: {
                    "active": boolean,"business_type_id": string | null,"created_at": string,"description": string | null,"icon": string | null,"id": string,"name": string,"seo": NonNullable<Json>,"slug": string,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "active"?: boolean,"business_type_id"?: string | null,"created_at"?: string,"description"?: string | null,"icon"?: string | null,"id"?: string,"name": string,"seo"?: NonNullable<Json>,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"business_type_id"?: string | null,"created_at"?: string,"description"?: string | null,"icon"?: string | null,"id"?: string,"name"?: string,"seo"?: NonNullable<Json>,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "industries_business_type_id_fkey"
      columns: ["business_type_id"]
isOneToOne: false
      referencedRelation: "business_types"
      referencedColumns: ["id"]
    }
                  ]
                },"marketing_plan_items": {
                  Row: {
                    "business_id": string,"channel": string | null,"created_at": string,"day_index": number,"description": string | null,"done": boolean,"id": string,"kind": string,"scheduled_date": string | null,"title": string,"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"channel"?: string | null,"created_at"?: string,"day_index": number,"description"?: string | null,"done"?: boolean,"id"?: string,"kind"?: string,"scheduled_date"?: string | null,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"channel"?: string | null,"created_at"?: string,"day_index"?: number,"description"?: string | null,"done"?: boolean,"id"?: string,"kind"?: string,"scheduled_date"?: string | null,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "marketing_plan_items_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string | null,"created_at": string,"href": string | null,"id": string,"read_at": string | null,"title": string,"type": string,"user_id": string
                  }
                  Insert: {
                    "body"?: string | null,"created_at"?: string,"href"?: string | null,"id"?: string,"read_at"?: string | null,"title": string,"type": string,"user_id": string
                  }
                  Update: {
                    "body"?: string | null,"created_at"?: string,"href"?: string | null,"id"?: string,"read_at"?: string | null,"title"?: string,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"name": string,"order_id": string,"product_id": string | null,"quantity": number,"total": number,"unit_price": number
                  }
                  Insert: {
                    "id"?: string,"name": string,"order_id": string,"product_id"?: string | null,"quantity"?: number,"total"?: number,"unit_price"?: number
                  }
                  Update: {
                    "id"?: string,"name"?: string,"order_id"?: string,"product_id"?: string | null,"quantity"?: number,"total"?: number,"unit_price"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "affiliate_id": string | null,"business_id": string | null,"coupon_code": string | null,"coupon_id": string | null,"created_at": string,"currency": string,"discount": number,"expires_at": string,"id": string,"metadata": NonNullable<Json>,"order_number": string,"paid_at": string | null,"payment_method": string,"product_id": string,"refunded_at": string | null,"status": Database["public"]['Enums']["order_status"],"subtotal": number,"terms_accepted_at": string | null,"total": number,"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "affiliate_id"?: string | null,"business_id"?: string | null,"coupon_code"?: string | null,"coupon_id"?: string | null,"created_at"?: string,"currency"?: string,"discount"?: number,"expires_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"order_number": string,"paid_at"?: string | null,"payment_method"?: string,"product_id": string,"refunded_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"terms_accepted_at"?: string | null,"total"?: number,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "affiliate_id"?: string | null,"business_id"?: string | null,"coupon_code"?: string | null,"coupon_id"?: string | null,"created_at"?: string,"currency"?: string,"discount"?: number,"expires_at"?: string,"id"?: string,"metadata"?: NonNullable<Json>,"order_number"?: string,"paid_at"?: string | null,"payment_method"?: string,"product_id"?: string,"refunded_at"?: string | null,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"terms_accepted_at"?: string | null,"total"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_affiliate_fk"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount": number,"created_at": string,"currency": string,"error": string | null,"id": string,"order_id": string,"provider": string,"provider_ref": string | null,"raw_event": Json | null,"status": Database["public"]['Enums']["payment_status"],"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "amount"?: number,"created_at"?: string,"currency"?: string,"error"?: string | null,"id"?: string,"order_id": string,"provider"?: string,"provider_ref"?: string | null,"raw_event"?: Json | null,"status"?: Database["public"]['Enums']["payment_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency"?: string,"error"?: string | null,"id"?: string,"order_id"?: string,"provider"?: string,"provider_ref"?: string | null,"raw_event"?: Json | null,"status"?: Database["public"]['Enums']["payment_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"pricing_packages": {
                  Row: {
                    "billing_unit": string | null,"business_id": string,"created_at": string,"description": string | null,"features": NonNullable<Json>,"id": string,"name": string,"price": number,"recommended": boolean,"sort_order": number,"tier": Database["public"]['Enums']["pricing_tier"],"updated_at": string
                  }
                  Insert: {
                    "billing_unit"?: string | null,"business_id": string,"created_at"?: string,"description"?: string | null,"features"?: NonNullable<Json>,"id"?: string,"name": string,"price"?: number,"recommended"?: boolean,"sort_order"?: number,"tier"?: Database["public"]['Enums']["pricing_tier"],"updated_at"?: string
                  }
                  Update: {
                    "billing_unit"?: string | null,"business_id"?: string,"created_at"?: string,"description"?: string | null,"features"?: NonNullable<Json>,"id"?: string,"name"?: string,"price"?: number,"recommended"?: boolean,"sort_order"?: number,"tier"?: Database["public"]['Enums']["pricing_tier"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "pricing_packages_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "active": boolean,"billing_interval": string | null,"created_at": string,"credits": number,"currency": string,"description": string | null,"entitlement_scope": string,"entitlements": (string)[],"features": NonNullable<Json>,"id": string,"kind": Database["public"]['Enums']["product_kind"],"name": string,"price": number,"recommended": boolean,"sale_price": number | null,"slug": string,"sort_order": number,"updated_at": string
                  }
                  Insert: {
                    "active"?: boolean,"billing_interval"?: string | null,"created_at"?: string,"credits"?: number,"currency"?: string,"description"?: string | null,"entitlement_scope"?: string,"entitlements"?: (string)[],"features"?: NonNullable<Json>,"id"?: string,"kind"?: Database["public"]['Enums']["product_kind"],"name": string,"price"?: number,"recommended"?: boolean,"sale_price"?: number | null,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"billing_interval"?: string | null,"created_at"?: string,"credits"?: number,"currency"?: string,"description"?: string | null,"entitlement_scope"?: string,"entitlements"?: (string)[],"features"?: NonNullable<Json>,"id"?: string,"kind"?: Database["public"]['Enums']["product_kind"],"name"?: string,"price"?: number,"recommended"?: boolean,"sale_price"?: number | null,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"credits": number,"email": string,"full_name": string | null,"id": string,"last_seen_at": string | null,"notification_prefs": NonNullable<Json>,"onboarding_draft": Json | null,"phone": string | null,"referral_code": string,"referred_by": string | null,"role": Database["public"]['Enums']["user_role"],"status": Database["public"]['Enums']["user_status"],"suspended_at": string | null,"suspended_reason": string | null,"updated_at": string
                  }
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"credits"?: number,"email": string,"full_name"?: string | null,"id": string,"last_seen_at"?: string | null,"notification_prefs"?: NonNullable<Json>,"onboarding_draft"?: Json | null,"phone"?: string | null,"referral_code": string,"referred_by"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"status"?: Database["public"]['Enums']["user_status"],"suspended_at"?: string | null,"suspended_reason"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"credits"?: number,"email"?: string,"full_name"?: string | null,"id"?: string,"last_seen_at"?: string | null,"notification_prefs"?: NonNullable<Json>,"onboarding_draft"?: Json | null,"phone"?: string | null,"referral_code"?: string,"referred_by"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"status"?: Database["public"]['Enums']["user_status"],"suspended_at"?: string | null,"suspended_reason"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_referred_by_fkey"
      columns: ["referred_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"referral_clicks": {
                  Row: {
                    "affiliate_id": string,"created_at": string,"id": string,"ip_hash": string | null,"landing_path": string | null,"user_agent": string | null
                  }
                  Insert: {
                    "affiliate_id": string,"created_at"?: string,"id"?: string,"ip_hash"?: string | null,"landing_path"?: string | null,"user_agent"?: string | null
                  }
                  Update: {
                    "affiliate_id"?: string,"created_at"?: string,"id"?: string,"ip_hash"?: string | null,"landing_path"?: string | null,"user_agent"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "referral_clicks_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    }
                  ]
                },"referral_signups": {
                  Row: {
                    "affiliate_id": string,"created_at": string,"id": string,"referred_user_id": string
                  }
                  Insert: {
                    "affiliate_id": string,"created_at"?: string,"id"?: string,"referred_user_id": string
                  }
                  Update: {
                    "affiliate_id"?: string,"created_at"?: string,"id"?: string,"referred_user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "referral_signups_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "referral_signups_referred_user_id_fkey"
      columns: ["referred_user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"services": {
                  Row: {
                    "active": boolean,"benefits": (string)[],"business_id": string,"created_at": string,"delivery_time": string | null,"description": string | null,"features": (string)[],"id": string,"name": string,"price": number,"sale_price": number | null,"sort_order": number,"target_customer": string | null,"unit": string | null,"updated_at": string,"upsell": string | null
                  }
                  Insert: {
                    "active"?: boolean,"benefits"?: (string)[],"business_id": string,"created_at"?: string,"delivery_time"?: string | null,"description"?: string | null,"features"?: (string)[],"id"?: string,"name": string,"price"?: number,"sale_price"?: number | null,"sort_order"?: number,"target_customer"?: string | null,"unit"?: string | null,"updated_at"?: string,"upsell"?: string | null
                  }
                  Update: {
                    "active"?: boolean,"benefits"?: (string)[],"business_id"?: string,"created_at"?: string,"delivery_time"?: string | null,"description"?: string | null,"features"?: (string)[],"id"?: string,"name"?: string,"price"?: number,"sale_price"?: number | null,"sort_order"?: number,"target_customer"?: string | null,"unit"?: string | null,"updated_at"?: string,"upsell"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "services_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"shares": {
                  Row: {
                    "active": boolean,"business_id": string,"created_at": string,"expires_at": string | null,"id": string,"sections": (string)[],"token": string,"updated_at": string,"view_count": number
                  }
                  Insert: {
                    "active"?: boolean,"business_id": string,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"sections"?: (string)[],"token": string,"updated_at"?: string,"view_count"?: number
                  }
                  Update: {
                    "active"?: boolean,"business_id"?: string,"created_at"?: string,"expires_at"?: string | null,"id"?: string,"sections"?: (string)[],"token"?: string,"updated_at"?: string,"view_count"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "shares_business_id_fkey"
      columns: ["business_id"]
isOneToOne: false
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "cancel_at_period_end": boolean,"canceled_at": string | null,"created_at": string,"current_period_end": string,"current_period_start": string,"id": string,"order_id": string | null,"product_id": string,"provider": string,"provider_ref": string | null,"status": Database["public"]['Enums']["subscription_status"],"updated_at": string,"user_id": string
                  }
                  Insert: {
                    "cancel_at_period_end"?: boolean,"canceled_at"?: string | null,"created_at"?: string,"current_period_end"?: string,"current_period_start"?: string,"id"?: string,"order_id"?: string | null,"product_id": string,"provider"?: string,"provider_ref"?: string | null,"status"?: Database["public"]['Enums']["subscription_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cancel_at_period_end"?: boolean,"canceled_at"?: string | null,"created_at"?: string,"current_period_end"?: string,"current_period_start"?: string,"id"?: string,"order_id"?: string | null,"product_id"?: string,"provider"?: string,"provider_ref"?: string | null,"status"?: Database["public"]['Enums']["subscription_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subscriptions_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subscriptions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"templates": {
                  Row: {
                    "active": boolean,"business_type_id": string | null,"category": Database["public"]['Enums']["template_category"],"config": NonNullable<Json>,"created_at": string,"id": string,"industry_id": string | null,"name": string,"updated_at": string,"version": number
                  }
                  Insert: {
                    "active"?: boolean,"business_type_id"?: string | null,"category": Database["public"]['Enums']["template_category"],"config"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"industry_id"?: string | null,"name": string,"updated_at"?: string,"version"?: number
                  }
                  Update: {
                    "active"?: boolean,"business_type_id"?: string | null,"category"?: Database["public"]['Enums']["template_category"],"config"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"industry_id"?: string | null,"name"?: string,"updated_at"?: string,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "templates_business_type_id_fkey"
      columns: ["business_type_id"]
isOneToOne: false
      referencedRelation: "business_types"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "templates_industry_id_fkey"
      columns: ["industry_id"]
isOneToOne: false
      referencedRelation: "industries"
      referencedColumns: ["id"]
    }
                  ]
                },"website_sites": {
                  Row: {
                    "business_id": string,"contact": NonNullable<Json>,"created_at": string,"is_published": boolean,"published_at": string | null,"sections": NonNullable<Json>,"slug": string,"theme": NonNullable<Json>,"updated_at": string
                  }
                  Insert: {
                    "business_id": string,"contact"?: NonNullable<Json>,"created_at"?: string,"is_published"?: boolean,"published_at"?: string | null,"sections"?: NonNullable<Json>,"slug": string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Update: {
                    "business_id"?: string,"contact"?: NonNullable<Json>,"created_at"?: string,"is_published"?: boolean,"published_at"?: string | null,"sections"?: NonNullable<Json>,"slug"?: string,"theme"?: NonNullable<Json>,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "website_sites_business_id_fkey"
      columns: ["business_id"]
isOneToOne: true
      referencedRelation: "businesses"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "adjust_credits":
{ Args: { "p_actor"?: string,"p_amount": number,"p_reason": string,"p_ref_id"?: string,"p_ref_type"?: string,"p_user_id": string }; Returns: number
                           },
"admin_dashboard_stats":
{ Args: { "p_days"?: number }; Returns: Json
                           },
"admin_funnel":
{ Args: { "p_days"?: number }; Returns: Json
                           },
"current_user_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"expire_stale_orders":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"generate_referral_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"get_my_sessions":
{ Args: Record<PropertyKey, never>; Returns: {
              "created_at": string,"id": string,"ip": string,"is_current": boolean,"updated_at": string,"user_agent": string
            }[]
                           },
"get_public_site":
{ Args: { "p_slug": string }; Returns: Json
                           },
"get_shared_kit":
{ Args: { "p_token": string }; Returns: Json
                           },
"global_search":
{ Args: { "lim"?: number,"q": string }; Returns: {
              "business_id": string,"href": string,"id": string,"kind": string,"subtitle": string,"title": string
            }[]
                           },
"increment_share_view":
{ Args: { "p_token": string }; Returns: undefined
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_super_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"next_order_number":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"owns_business":
{ Args: { "bid": string }; Returns: boolean
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           }
          }
          Enums: {
            "affiliate_status": "pending"|"approved"|"rejected"|"paid","asset_category": "brand"|"services"|"pricing"|"sales"|"marketing"|"content"|"website"|"finance"|"operations"|"documents","business_status": "draft"|"generating"|"ready"|"archived","checklist_kind": "launch"|"daily"|"weekly"|"customer_workflow"|"sales_workflow"|"delivery_workflow","commission_status": "pending"|"approved"|"paid"|"rejected","contact_status": "new"|"read"|"replied"|"archived","content_platform": "facebook"|"tiktok"|"instagram"|"threads","content_status": "idea"|"draft"|"ready"|"published","coupon_type": "fixed"|"percentage","document_type": "quotation"|"proposal"|"service_agreement"|"client_brief"|"invoice"|"intake_form","export_format": "pdf"|"csv"|"txt"|"md"|"zip","export_status": "pending"|"processing"|"ready"|"failed","finance_calc_type": "startup_cost"|"monthly_expenses"|"revenue_target"|"profit"|"break_even","job_status": "pending"|"processing"|"completed"|"failed","order_status": "pending"|"paid"|"failed"|"expired"|"refunded","payment_status": "pending"|"processing"|"succeeded"|"failed"|"refunded","pricing_tier": "basic"|"standard"|"premium"|"custom","product_kind": "free"|"one_time"|"subscription","subscription_status": "active"|"canceled"|"expired"|"past_due","template_category": "brand"|"pricing"|"sales"|"marketing"|"content"|"website"|"operations"|"documents","user_role": "user"|"admin"|"super_admin","user_status": "active"|"suspended"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "affiliate_status": ["pending", "approved", "rejected", "paid"],"asset_category": ["brand", "services", "pricing", "sales", "marketing", "content", "website", "finance", "operations", "documents"],"business_status": ["draft", "generating", "ready", "archived"],"checklist_kind": ["launch", "daily", "weekly", "customer_workflow", "sales_workflow", "delivery_workflow"],"commission_status": ["pending", "approved", "paid", "rejected"],"contact_status": ["new", "read", "replied", "archived"],"content_platform": ["facebook", "tiktok", "instagram", "threads"],"content_status": ["idea", "draft", "ready", "published"],"coupon_type": ["fixed", "percentage"],"document_type": ["quotation", "proposal", "service_agreement", "client_brief", "invoice", "intake_form"],"export_format": ["pdf", "csv", "txt", "md", "zip"],"export_status": ["pending", "processing", "ready", "failed"],"finance_calc_type": ["startup_cost", "monthly_expenses", "revenue_target", "profit", "break_even"],"job_status": ["pending", "processing", "completed", "failed"],"order_status": ["pending", "paid", "failed", "expired", "refunded"],"payment_status": ["pending", "processing", "succeeded", "failed", "refunded"],"pricing_tier": ["basic", "standard", "premium", "custom"],"product_kind": ["free", "one_time", "subscription"],"subscription_status": ["active", "canceled", "expired", "past_due"],"template_category": ["brand", "pricing", "sales", "marketing", "content", "website", "operations", "documents"],"user_role": ["user", "admin", "super_admin"],"user_status": ["active", "suspended"]
          }
        }
} as const
