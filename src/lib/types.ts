export type Status = "Utkast" | "Sendt" | "Bekreftet";

export interface Team {
  id: number;
  name: string;
  email?: string | null;
  created_at: string;
}

export interface Article {
  id: number;
  name: string;
  article_number: string;
  price: number;
  sizes: string[];
  created_at: string;
}

export interface Order {
  id: number;
  team_id: number;
  team_name: string;
  contact_person: string;
  status: Status;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  article_id: number;
  article_name: string;
  article_number: string;
  price: number;
  size: string;
  quantity: number;
  print_name: string;
  print_number: string;
}
