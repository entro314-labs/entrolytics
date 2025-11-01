import {
	Form,
	FormField,
	FormButtons,
	FormSubmitButton,
	TextField,
	Button,
} from "@entro314labs/entro-zen";
import { getRandomChars } from "@/lib/crypto";
import { useMessages, useOrg, useUpdateQuery } from "@/components/hooks";

const generateId = () => `org_${getRandomChars(16)}`;

export function OrgEditForm({
	orgId,
	allowEdit,
	onSave,
}: {
	orgId: string;
	allowEdit?: boolean;
	onSave?: () => void;
}) {
	const org = useOrg();
	const { formatMessage, labels, messages } = useMessages();

	const { mutate, error, isPending, touch, toast } = useUpdateQuery(
		`/orgs/${orgId}`,
	);

	const handleSubmit = async (data: any) => {
		mutate(data, {
			onSuccess: async () => {
				toast(formatMessage(messages.saved));
				touch("orgs");
				touch(`orgs:${orgId}`);
				onSave?.();
			},
		});
	};

	return (
		<Form onSubmit={handleSubmit} error={error} defaultValues={{ ...org }}>
			{({ setValue }) => {
				return (
					<>
						<FormField name="id" label={formatMessage(labels.orgId)}>
							<TextField isReadOnly allowCopy />
						</FormField>
						<FormField
							name="name"
							label={formatMessage(labels.name)}
							rules={{ required: formatMessage(labels.required) }}
						>
							<TextField isReadOnly={!allowEdit} />
						</FormField>
						<FormField
							name="accessCode"
							label={formatMessage(labels.accessCode)}
						>
							<TextField isReadOnly allowCopy />
						</FormField>
						{allowEdit && (
							<FormButtons justifyContent="space-between">
								<Button
									onPress={() =>
										setValue("accessCode", generateId(), { shouldDirty: true })
									}
								>
									{formatMessage(labels.regenerate)}
								</Button>
								<FormSubmitButton variant="primary" isPending={isPending}>
									{formatMessage(labels.save)}
								</FormSubmitButton>
							</FormButtons>
						)}
					</>
				);
			}}
		</Form>
	);
}
