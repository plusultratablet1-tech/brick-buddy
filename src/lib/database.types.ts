// Generated from Supabase project dyevdriqotjliumnistw on 2026-09-15.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      admin_users: {
        Row: { created_at: string; email: string; is_active: boolean; user_id: string };
        Insert: { created_at?: string; email: string; is_active?: boolean; user_id: string };
        Update: { created_at?: string; email?: string; is_active?: boolean; user_id?: string };
        Relationships: [];
      };
      launch_batches: {
        Row: { balance_amount: number; capacity: number; code: string; created_at: string; hold_hours: number; id: string; is_active: boolean; name: string; reservation_amount: number; unit_price: number };
        Insert: { balance_amount: number; capacity: number; code: string; created_at?: string; hold_hours: number; id?: string; is_active?: boolean; name: string; reservation_amount: number; unit_price: number };
        Update: { balance_amount?: number; capacity?: number; code?: string; created_at?: string; hold_hours?: number; id?: string; is_active?: boolean; name?: string; reservation_amount?: number; unit_price?: number };
        Relationships: [];
      };
      notification_outbox: {
        Row: { attempt_count: number; created_at: string; id: string; last_attempt_at: string | null; last_error: string | null; order_id: string | null; payload: Json; provider_message_id: string | null; recipient: string; status: string; template: string };
        Insert: { attempt_count?: number; created_at?: string; id?: string; last_attempt_at?: string | null; last_error?: string | null; order_id?: string | null; payload?: Json; provider_message_id?: string | null; recipient: string; status?: string; template: string };
        Update: { attempt_count?: number; created_at?: string; id?: string; last_attempt_at?: string | null; last_error?: string | null; order_id?: string | null; payload?: Json; provider_message_id?: string | null; recipient?: string; status?: string; template?: string };
        Relationships: [{ foreignKeyName: "notification_outbox_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }];
      };
      order_events: {
        Row: { actor_type: string; actor_user_id: string | null; created_at: string; customer_visible: boolean; event_type: string; from_status: string | null; id: string; message: string | null; order_id: string; title: string; to_status: string | null };
        Insert: { actor_type: string; actor_user_id?: string | null; created_at?: string; customer_visible?: boolean; event_type: string; from_status?: string | null; id?: string; message?: string | null; order_id: string; title: string; to_status?: string | null };
        Update: { actor_type?: string; actor_user_id?: string | null; created_at?: string; customer_visible?: boolean; event_type?: string; from_status?: string | null; id?: string; message?: string | null; order_id?: string; title?: string; to_status?: string | null };
        Relationships: [{ foreignKeyName: "order_events_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }];
      };
      orders: {
        Row: { balance_amount: number; balance_total: number; batch_id: string; created_at: string; customer_name: string; email: string; fulfillment: string; hold_expires_at: string; id: string; mobile: string; order_number: string; quantity: number; reservation_amount: number; reservation_total: number; status: string; total_amount: number; unit_price: number; updated_at: string };
        Insert: { balance_amount: number; balance_total: number; batch_id: string; created_at?: string; customer_name: string; email: string; fulfillment: string; hold_expires_at: string; id?: string; mobile: string; order_number: string; quantity: number; reservation_amount: number; reservation_total: number; status?: string; total_amount: number; unit_price: number; updated_at?: string };
        Update: { balance_amount?: number; balance_total?: number; batch_id?: string; created_at?: string; customer_name?: string; email?: string; fulfillment?: string; hold_expires_at?: string; id?: string; mobile?: string; order_number?: string; quantity?: number; reservation_amount?: number; reservation_total?: number; status?: string; total_amount?: number; unit_price?: number; updated_at?: string };
        Relationships: [{ foreignKeyName: "orders_batch_id_fkey"; columns: ["batch_id"]; isOneToOne: false; referencedRelation: "launch_batches"; referencedColumns: ["id"] }];
      };
      payments: {
        Row: { admin_note: string | null; customer_note: string | null; expected_amount: number; id: string; kind: string; order_id: string; proof_mime_type: string; proof_original_name: string; proof_path: string; reviewed_at: string | null; reviewed_by: string | null; status: string; submitted_amount: number | null; submitted_at: string };
        Insert: { admin_note?: string | null; customer_note?: string | null; expected_amount: number; id?: string; kind: string; order_id: string; proof_mime_type: string; proof_original_name: string; proof_path: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; submitted_amount?: number | null; submitted_at?: string };
        Update: { admin_note?: string | null; customer_note?: string | null; expected_amount?: number; id?: string; kind?: string; order_id?: string; proof_mime_type?: string; proof_original_name?: string; proof_path?: string; reviewed_at?: string | null; reviewed_by?: string | null; status?: string; submitted_amount?: number | null; submitted_at?: string };
        Relationships: [{ foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_preorder: {
        Args: { p_customer_name: string; p_email: string; p_fulfillment: string; p_mobile: string; p_quantity: number };
        Returns: { balance_total: number; hold_expires_at: string; order_number: string; quantity: number; remaining_slots: number; reservation_total: number; status: string; total_amount: number }[];
      };
      get_preorder_availability: { Args: never; Returns: { capacity: number; remaining_slots: number; sold_out: boolean }[] };
      review_payment: { Args: { p_action: string; p_actor_user_id?: string; p_admin_note?: string; p_payment_id: string }; Returns: { order_number: string; order_status: string; payment_id: string; payment_status: string }[] };
      submit_payment_proof: { Args: { p_order_number: string; p_email: string; p_kind: string; p_submitted_amount: number; p_customer_note: string; p_proof_path: string; p_proof_mime_type: string; p_proof_original_name: string }; Returns: { payment_id: string; payment_kind: string; payment_status: string }[] };
      transition_order_status: { Args: { p_actor_user_id?: string; p_message?: string; p_order_number: string; p_to_status: string }; Returns: { from_status: string; order_number: string; to_status: string; updated_at: string }[] };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
