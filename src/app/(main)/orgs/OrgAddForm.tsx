import { useMessages, useUpdateQuery } from "@/components/hooks";
import {
	Button,
	Form,
	FormButtons,
	FormField,
	FormSubmitButton,
	TextField,
} from "@entro314labs/entro-zen";

export function OrgAddForm({
	onSave,
	onClose,
}: {
	onSave: () => void;
	onClose: () => void;
}) {
	const { formatMessage, labels } = useMessages();
	const { mutate, error, isPending } = useUpdateQuery("/orgs");

	const handleSubmit = async (data: any) => {
		mutate(data, {
			onSuccess: async () => {
				onSave?.();
				onClose?.();
			},
		});
	};

	return (
		<Form onSubmit={handleSubmit} error={error}>
			<FormField name="name" label={formatMessage(labels.name)}>
				<TextField autoComplete="off" />
			</FormField>
			<FormButtons>
				<Button isDisabled={isPending} onPress={onClose}>
					{formatMessage(labels.cancel)}
				</Button>
				<FormSubmitButton variant="primary" isDisabled={isPending}>
					{formatMessage(labels.save)}
				</FormSubmitButton>
			</FormButtons>
		</Form>
	);
}
