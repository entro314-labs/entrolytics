import { useApi } from "../useApi";
import { useModified } from "../useModified";
import { isValidUuid } from "@/lib/uuid";

export function usePixelQuery(pixelId: string) {
	const { get, useQuery } = useApi();
	const { modified } = useModified(`pixel:${pixelId}`);

	return useQuery({
		queryKey: ["pixel", { pixelId, modified }],
		queryFn: () => {
			return get(`/pixels/${pixelId}`);
		},
		enabled: !!pixelId && isValidUuid(pixelId),
	});
}
