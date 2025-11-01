import { AlertDialog, Row } from "@entro314labs/entro-zen";
import { useDeleteQuery, useMessages, useModified } from "@/components/hooks";

export function UserDeleteForm({
	userId,
	displayName,
	onSave,
	onClose,
}: {
	userId: string;
	displayName: string;
	onSave?: () => void;
	onClose?: () => void;
}) {
	const { messages, labels, formatMessage } = useMessages();
	const { mutate } = useDeleteQuery(`/users/${userId}`);
	const { touch } = useModified();

	const handleConfirm = async () => {
		mutate(null, {
			onSuccess: async () => {
				touch("users");
				touch(`users:${userId}`);
				onSave?.();
				onClose?.();
			},
		});
	};

	return (
		<AlertDialog
			title={formatMessage(labels.delete)}
			onConfirm={handleConfirm}
			onCancel={onClose}
			confirmLabel={formatMessage(labels.delete)}
			isDanger
		>
			<Row gap="1">
				{formatMessage(messages.confirmDelete, { target: displayName })}
			</Row>
		</AlertDialog>
	);
}
