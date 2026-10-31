import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chat.service";
import { CHAT_ENDPOINTS } from "../endpoints/chat.endpoint";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ChatMessageRequest, ChatMessageResponse } from "@/interfaces/chat.interface";

export function useChatHistory() {
  return useQuery({
    queryKey: [QUERY_KEYS.CHAT_HISTORY],
    queryFn: () => chatService.getHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<ChatMessageResponse, Error, ChatMessageRequest>({
    mutationFn: (payload: ChatMessageRequest) => chatService.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_HISTORY] });
    },
  });
}

export function useConfirmChatAction() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationFn: (token: string) => chatService.confirmAction(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatService.clearHistory(),
    onSuccess: () => {
      queryClient.setQueryData([QUERY_KEYS.CHAT_HISTORY], []);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAT_HISTORY] });
    },
  });
}
