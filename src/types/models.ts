export interface Course {
  id: string;
  title: string;
  description: string;
  price: number; // in cents
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_uid: string; // Cloudflare Stream video UID
  position: number;
  is_preview: boolean;
}

export interface Purchase {
  id: string;
  user_id: string; // Clerk user ID
  course_id: string;
  stripe_payment_id: string;
  amount: number; // in cents
  created_at: string;
}
