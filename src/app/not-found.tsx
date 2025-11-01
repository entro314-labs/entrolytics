"use client";
import { Flexbox } from "@entro314labs/entro-zen";
import { useMessages } from "@/components/hooks";

export default function () {
	const { formatMessage, labels } = useMessages();

	return (
		<Flexbox
			alignItems="center"
			justifyContent="center"
			flexGrow="1"
			minHeight="600px"
		>
			<h1>{formatMessage(labels.pageNotFound)}</h1>
		</Flexbox>
	);
}
