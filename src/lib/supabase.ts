// Database types for PostgreSQL backend
export interface User {
  id_user: string;
  username: string;
  role: 'User' | 'Admin';
  last_login: string | null;
  created_at: string;
}

export interface Kandang {
  id_kandang: string;
  nama_kandang: string;
  added_date: string;
}

export interface Vaksin {
  id_vaksin: string;
  nama_vaksin: string;
  added_at: string;
}

export interface Kambing {
  id_kambing: string;
  keturunan: string;
  added_date: string;
  vaksin_id: string | null;
  kandang_id: string | null;
  image_path: string | null;
  vaksin?: Vaksin;
  kandang?: Kandang;
  nama_kandang?: string;
  nama_vaksin?: string;
}

export interface Vaksinisasi {
  id_vaksinisasi: string;
  id_kambing: string;
  id_vaksin: string;
  dosis_vaksin: string;
  vaksin_date: string;
  created_at: string;
  kambing?: Kambing;
  vaksin?: Vaksin;
}

export interface GateKandang {
  id_gate: string;
  id_kandang: string;
  id_kambing: string;
  status: 'Masuk' | 'Keluar';
  datetime: string;
  kandang?: Kandang;
  kambing?: Kambing;
}