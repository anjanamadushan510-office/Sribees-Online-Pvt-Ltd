import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import {
  RequestOtpRequest,
  RequestOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "@/interfaces/auth.interface";
import { useAuthStore } from "@/state/auth.store";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useRequestOtp = () => {
  return useMutation<RequestOtpResponse, Error, RequestOtpRequest>({
    mutationFn: (data: RequestOtpRequest) => authService.requestOtp(data),
  });
};

export const useVerifyOtp = () => {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<VerifyOtpResponse, Error, VerifyOtpRequest>({
    mutationFn: (data: VerifyOtpRequest) => authService.verifyOtp(data),
    onSuccess: (res) => {
      if (res.user && res.tokens) {
        setAuth(res.user, res.tokens);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH_ME] });
      }
    },
  });
};

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfileRequest>({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (res) => {
      if (res.user) {
        setUser(res.user);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.AUTH_ME] });
      }
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useLogoutAll = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logoutAll(),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useGetMe = () => {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.AUTH_ME],
    queryFn: async () => {
      const res = await authService.getMe();
      if (res.user) {
        setUser(res.user);
      }
      return res.user;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSessions = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.SESSIONS],
    queryFn: () => authService.getSessions(),
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => authService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSIONS] });
    },
  });
};

export const useLogoutOthers = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logoutOthers(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSIONS] });
    },
  });
};

export const useRequestAccountDeletionOtp = () => {
  return useMutation<RequestOtpResponse, Error, void>({
    mutationFn: () => authService.requestAccountDeletionOtp(),
  });
};

export const useConfirmAccountDeletion = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { code: string; reason?: string }>({
    mutationFn: (data: { code: string; reason?: string }) => authService.confirmAccountDeletion(data),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useGetSupportInfo = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.SUPPORT_INFO],
    queryFn: () => authService.getSupportInfo(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

