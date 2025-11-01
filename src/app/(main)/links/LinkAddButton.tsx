import { useMessages, useModified } from "@/components/hooks";
import {
	Button,
	Icon,
	Modal,
	Dialog,
	DialogTrigger,
	Text,
	useToast,
} from "@entro314labs/entro-zen";
import { Plus } from "@/components/icons";
import { LinkEditForm } from "./LinkEditForm";

export function LinkAddButton({ orgId }: { orgId?: string }) {
	const { formatMessage, labels, messages } = useMessages();
	const { toast } = useToast();
	const { touch } = useModified();

	const handleSave = async () => {
		toast(formatMessage(messages.saved));
		touch("links");
	};

	return (
		<DialogTrigger>
			<Button data-test="button-website-add" variant="primary">
				<Icon>
					<Plus />
				</Icon>
				<Text>{formatMessage(labels.addLink)}</Text>
			</Button>
			<Modal>
				<Dialog title={formatMessage(labels.addLink)} style={{ width: 600 }}>
					{({ close }) => (
						<LinkEditForm orgId={orgId} onSave={handleSave} onClose={close} />
					)}
				</Dialog>
			</Modal>
		</DialogTrigger>
	);
}
