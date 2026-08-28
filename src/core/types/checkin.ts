import type { Scale1to5 } from "@/core/types/sleep";

export interface CheckIn {
  id: string;
  userId: string;
  localDate: string;
  timezone: string;
  mood?: Scale1to5;
  energy?: Scale1to5;
  focus?: Scale1to5;
  stress?: Scale1to5;
  createdAt: number;
  updatedAt: number;
}
