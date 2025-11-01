import { useApi } from "../useApi";
import { useModified } from "@/components/hooks";
import { keepPreviousData } from "@tanstack/react-query";
import { ReactQueryOptions } from "@/lib/types";
import { isValidUuid } from "@/lib/uuid";

export function useOrgQuery(orgId: string, options?: ReactQueryOptions) {
	const { get, useQuery } = useApi();
	const { modified } = useModified(`orgs:${orgId}`);

	return useQuery({
		queryKey: ["orgs", { orgId, modified }],
		queryFn: () => get(`/orgs/${orgId}`),
		enabled: !!orgId && isValidUuid(orgId),
		placeholderData: keepPreviousData,
		...options,
	});
}
