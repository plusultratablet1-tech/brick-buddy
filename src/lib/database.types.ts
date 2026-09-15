// Generated from Supabase project dyevdriqotjliumnistw on 2026-09-15.
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      launch_batches: {
        Row: {
          balance_amount: number;
          capacity: number;
          code: string;
          created_at: string;
          hold_hours: number;
          id: string;
          is_active: boolean;
          name: string;
          reservation_amount: number;
          unit_price: number;
        };
        Insert: {
          balance_amount: number;
          capacity: number;
          code: string;
          created_at?: string;
          hold_hours: number;
          id?: string;
          is_active?: boolean;
          name: string;
          reservation_amount: number;
          unit_price: number;
        };
        Update: {
          balance_amount?: number;
          capacity?: number;
          code?: string;
          created_at?: string;
          hold_hours?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          reservation_amount?: number;
          unit_price?: number;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          balance_amount: number;
          balance_total: number;
          batch_id: string;
          created_at: string;
          customer_name: string;
          email: string;
          fulfillment: string;
          hold_expires_at: string;
          id: string;
          mobile: string;
          order_number: string;
          quantity: number;
          reservation_amount: number;
          reservation_total: number;
          status: string;
          total_amount: number;
          unit_price: number;
          updated_at: string;
        };
        Insert: {
          balance_amount: number;
          balance_total: number;
          batch_id: string;
          created_at?: string;
          customer_name: string;
          email: string;
          fulfillment: string;
          hold_expires_at: string;
          id?: string;
          mobile: string;
          order_number: string;
          quantity: number;
          reservation_amount: number;
          reservation_total: number;
          status?: string;
          total_amount: number;
          unit_price: number;
          updated_at?: string;
        };
        Update: {
          balance_amount?: number;
          balance_total?: number;
          batch_id?: string;
          created_at?: string;
          customer_name?: string;
          email?: string;
          fulfillment?: string;
          hold_expires_at?: string;
          id?: string;
          mobile?: string;
          order_number?: string;
          quantity?: number;
          reservation_amount?: number;
          reservation_total?: number;
          status?: string;
          total_amount?: number;
          unit_price?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "launch_batches";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_preorder: {
        Args: {
          p_customer_name: string;
          p_email: string;
          p_fulfillment: string;
          p_mobile: string;
          p_quantity: number;
        };
        Returns: {
          balance_total: number;
          hold_expires_at: string;
          order_number: string;
          quantity: number;
          remaining_slots: number;
          reservation_total: number;
          status: string;
          total_amount: number;
        }[];
      };
      get_preorder_availability: {
        Args: never;
        Returns: {
          capacity: number;
          remaining_slots: number;
          sold_out: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
