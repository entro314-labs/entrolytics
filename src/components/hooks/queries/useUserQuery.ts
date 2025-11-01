import { useApi } from "../useApi";
import { useModified } from "@/components/hooks";
import { keepPreviousData } from "@tanstack/react-query";
import { ReactQueryOptions } from "@/lib/types";
import { isValidUuid } from "@/lib/uuid";

export function useUserQuery(userId: string, options?: ReactQueryOptions) {
	const { get, useQuery } = useApi();
	const { modified } = useModified(`user:${userId}`);

	return useQuery({
		queryKey: ["users", { userId, modified }],
		queryFn: () => get(`/users/${userId}`),
		enabled: !!userId && isValidUuid(userId),
		placeholderData: keepPreviousData,
		...options,
	});
}
