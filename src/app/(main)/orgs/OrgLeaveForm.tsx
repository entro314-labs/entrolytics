import { useDeleteQuery, useMessages, useModified } from "@/components/hooks";
import { ConfirmationForm } from "@/components/common/ConfirmationForm";

export function OrgLeaveForm({
	orgId,
	userId,
	orgName,
	onSave,
	onClose,
}: {
	orgId: string;
	userId: string;
	orgName: string;
	onSave: () => void;
	onClose: () => void;
}) {
	const { formatMessage, labels, messages } = useMessages();
	const { mutate, error, isPending } = useDeleteQuery(
		`/orgs/${orgId}/users/${userId}`,
	);
	const { touch } = useModified();

	const handleConfirm = async () => {
		mutate(null, {
			onSuccess: async () => {
				touch("orgs:members");
				onSave();
				onClose();
			},
		});
	};

	return (
		<ConfirmationForm
			buttonLabel={formatMessage(labels.leave)}
			message={formatMessage(messages.confirmLeave, {
				target: orgName,
			})}
			onConfirm={handleConfirm}
			onClose={onClose}
			isLoading={isPending}
			error={error}
		/>
	);
}
