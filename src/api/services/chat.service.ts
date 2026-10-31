import { apiClient } from "@/utils/apiClient";
import { CHAT_ENDPOINTS } from "../endpoints/chat.endpoint";
import {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatStreamStageEvent,
  ChatStreamErrorEvent,
} from "@/interfaces/chat.interface";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { API_BASE_URL } from "@/constants/config";

export const chatService = {
  /**
   * Send a chat message (single turn, answered in full JSON).
   */
  async sendMessage(payload: ChatMessageRequest): Promise<ChatMessageResponse> {
    const body: ChatMessageRequest = {
      message: payload.message,
      image_base64: payload.image_base64 || null,
      image_mime_type: payload.image_mime_type || null,
    };
    const response = await apiClient.post(CHAT_ENDPOINTS.SEND_MESSAGE, body);
    return response.data?.data ?? response.data;
  },

  /**
   * Send a chat message with stream progress (SSE text/event-stream over POST).
   */
  async sendMessageStream(
    payload: ChatMessageRequest,
    handlers: {
      onStage?: (stageData: ChatStreamStageEvent) => void;
      onDone?: (data: ChatMessageResponse) => void;
      onError?: (errData: ChatStreamErrorEvent) => void;
    }
  ): Promise<void> {
    const url = `${API_BASE_URL}${CHAT_ENDPOINTS.SEND_MESSAGE_STREAM}`;

    let deviceId = "";
    let accessToken = "";

    if (typeof window !== "undefined") {
      deviceId = localStorage.getItem("x_device_id") || "";
      accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream, application/json",
    };

    if (deviceId) {
      headers["X-Device-Id"] = deviceId;
    }

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const body: ChatMessageRequest = {
      message: payload.message,
      image_base64: payload.image_base64 || null,
      image_mime_type: payload.image_mime_type || null,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMsg = `Server error ${response.status}`;
        try {
          const errJson = await response.json();
          errorMsg = errJson.message || errJson.error?.message || errorMsg;
        } catch (_) {}
        handlers.onError?.({
          code: "HTTP_ERROR",
          message: errorMsg,
        });
        return;
      }

      if (!response.body) {
        // Fallback if browser stream is not available
        const json = await response.json();
        handlers.onDone?.(json.data ?? json);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep unfinished tail in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.substring(6).trim();
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.substring(5).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (currentEvent === "stage") {
                handlers.onStage?.(parsed);
              } else if (currentEvent === "done") {
                handlers.onDone?.(parsed.data ?? parsed);
              } else if (currentEvent === "error") {
                handlers.onError?.(parsed);
              } else {
                // Default fallback if no event prefix
                if (parsed.stage) {
                  handlers.onStage?.(parsed);
                } else if (parsed.reply) {
                  handlers.onDone?.(parsed.data ?? parsed);
                }
              }
            } catch (err) {
              console.warn("Failed to parse SSE data block:", dataStr, err);
            }
          }
        }
      }
    } catch (err: any) {
      handlers.onError?.({
        code: "NETWORK_ERROR",
        message: err.message || "Network request failed",
      });
    }
  },

  /**
   * Confirm an action proposed by the assistant.
   */
  async confirmAction(token: string): Promise<any> {
    const response = await apiClient.post(CHAT_ENDPOINTS.CONFIRM_ACTION, {
      token,
    });
    return response.data?.data ?? response.data;
  },

  /**
   * Fetch conversation history.
   */
  async getHistory(): Promise<any> {
    const response = await apiClient.get(CHAT_ENDPOINTS.HISTORY);
    return response.data?.data ?? response.data;
  },

  /**
   * Clear conversation history.
   */
  async clearHistory(): Promise<any> {
    const response = await apiClient.delete(CHAT_ENDPOINTS.HISTORY);
    return response.data?.data ?? response.data;
  },
};
