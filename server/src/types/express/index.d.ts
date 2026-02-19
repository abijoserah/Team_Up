import type { JwtPayload } from "jsonwebtoken";

// to make the file a module and avoid the TypeScript error
declare global {
  namespace Express {
    export interface Request {
      /* ************************************************************************* */
      // Add your custom properties here, for example:
      //
      // user?: { ... }
      /* ************************************************************************* */
      auth: MyPayload;
    }
  }

  type MyPayload = JwtPayload & { sub: string };

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

  type Participant = {
    id: number;
    userId: number;
    username: string;
    picture: string;
    status: string;
  };

  type Filters = {
    sport: string;
    city: string;
    playingAt: string;
    locker: boolean;
    shower: boolean;
    toilet: boolean;
    air_conditioning: boolean;
    level: string | null;
    price: number | null;
    disabled: boolean;
  };

  type ActivityForm = {
    description?: string;
    address: string;
    city: string;
    zip_code: string;
    playing_at: string;
    playing_time: string;
    playing_duration: number;
    nb_spots: number;
    auto_validation: boolean;
    price?: number;
    visibility: boolean;
    level?: "beginner" | "amateur" | "advanced" | "all";
    disabled?: boolean;
    locker?: boolean;
    shower?: boolean;
    air_conditioning?: boolean;
    toilet?: boolean;
    user_id: number;
    sport_id: number;
  };

  type Sport = {
    id: number;
    name: string;
  };

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

  type newUserType = {
    userId?: number;
    activityId?: number;
    status?: string;
  };

  type MailData = {
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
    organizer_email: string;
    organizer_username: string;
    participant_email: string;
    participant_username: string;
  };

  type Message = {
    id: number;
    activity_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    like_count: number;
    username: string;
  };
}
