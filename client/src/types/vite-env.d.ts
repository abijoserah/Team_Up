/// <reference types="vite/client" />
// This provides types for the Vite-injected env variables on import.meta.env
// See https://vite.dev/guide/features.html#client-types

type Activity = {
  id: number;
  address: string;
  city: string;
  zip_code: string;
  description: string;
  playing_at: string;
  playing_time: string;
  playing_duration: number;
  nb_spots: number;
  auto_validation: boolean;
  price: string;
  visibility: boolean;
  level: string;
  disabled: boolean;
  locker: boolean;
  shower: boolean;
  air_conditioning: boolean;
  toilet: boolean;
  user_id: number;
  sport_id: number;
  username: string;
  user_picture: string;
  name: string;
  nb_participant: number;
  total_participant: number;
  participation_status: string;
};

type User = {
  id: number;
  email: string;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  born_at: string;
  address: string;
  city: string;
  zip_code: string;
  phone: string;
  picture: string;
};

type UserProfile = Omit<User, "password">;

type Auth = {
  user: User;
  token: string;
};

type Participant = {
  id: number;
  userId: number;
  username: string;
  picture: string;
  status: string;
};
