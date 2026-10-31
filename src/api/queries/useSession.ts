import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "../services/session.service";
import {
  SetLocationRequest,
  SetLocationResponse,
} from "@/interfaces/session.interface";
import { useSessionStore } from "@/state/session.store";
import { useUIStore } from "@/state/ui.store";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useSetLocation = () => {
  const { setLocation } = useSessionStore();
  const { setSelectedLocation } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation<SetLocationResponse, Error, SetLocationRequest>({
    mutationFn: (data: SetLocationRequest) => sessionService.setLocation(data),
    onSuccess: (res) => {
      if (res.data) {
        setLocation(res.data);
        if (res.data.branch_name) {
          setSelectedLocation(res.data.branch_name);
        }
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.SESSION_LOCATION],
        });
      }
    },
  });
};
