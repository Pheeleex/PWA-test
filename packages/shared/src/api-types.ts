export interface Incident {
  incident_id?: string | number;
  id?: string;
  incident_name?: string;
  title?: string;
  type?: string;
  description: string;
  status: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  image?: string;
  photo?: string;
  user_id?: number;
  promoter_id?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  admin_note?: string;
}

export interface ApiLocation {
  id?: string | number;
  location_id?: string | number;
  name?: string;
  location_name?: string;
  category?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  is_active?: boolean | number;
  description?: string;
  address?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  type?: "green" | "red" | string;
}
