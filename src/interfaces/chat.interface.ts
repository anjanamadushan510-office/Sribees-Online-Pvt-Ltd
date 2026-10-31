import { Product } from "./product.interface";

export interface ChatMessageRequest {
  message: string;
  image_base64?: string | null;
  image_mime_type?: string | null;
}

export interface ChatAction {
  action_type: string;
  description: string;
  token?: string;
  [key: string]: any;
}

export interface ChatMessageResponse {
  reply: string;
  language?: string;
  products?: any[];
  orders?: any[];
  actions?: ChatAction[];
  panels?: any[];
  guide?: any;
}

export interface ChatStreamStageEvent {
  stage: "understanding" | "searching" | "orders" | "preparing";
  terms?: string[];
}

export interface ChatStreamErrorEvent {
  code: "TIMEOUT" | "AI_UNAVAILABLE" | "INTERNAL" | string;
  message: string;
}

export interface ChatHistoryItem {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  actions?: ChatAction[];
  quickReplies?: string[];
  imageUrl?: string;
}

export interface ChatConfirmRequest {
  token: string;
}
