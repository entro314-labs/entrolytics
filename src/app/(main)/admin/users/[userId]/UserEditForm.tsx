import {
	Select,
	ListItem,
	Form,
	FormField,
	FormButtons,
	TextField,
	FormSubmitButton,
} from "@entro314labs/entro-zen";
import {
	useLoginQuery,
	useMessages,
	useUpdateQuery,
	useUser,
} from "@/components/hooks";
import { ROLES } from "@/lib/constants";

export function UserEditForm({
	userId,
	onSave,
}: {
	userId: string;
	onSave?: () => void;
}) {
	const { formatMessage, labels, messages, getMessage } = useMessages();
	const user = useUser();
	const { user: login } = useLoginQuery();

	const { mutate, error, toast, touch } = useUpdateQuery(`/users/${userId}`);

	const handleSubmit = async (data: any) => {
		mutate(data, {
			onSuccess: async () => {
				toast(formatMessage(messages.saved));
				touch(`user:${user.id}`);
				onSave?.();
			},
		});
	};

	return (
		<Form
			onSubmit={handleSubmit}
			error={getMessage(error?.message)}
			values={user}
		>
			<FormField name="email" label={formatMessage(labels.email)}>
				<TextField data-test="input-email" type="email" />
			</FormField>
			<FormField name="displayName" label={formatMessage(labels.name)}>
				<TextField data-test="input-displayName" />
			</FormField>

			{user.id !== login.id && (
				<FormField
					name="role"
					label={formatMessage(labels.role)}
					rules={{ required: formatMessage(labels.required) }}
				>
					<Select defaultSelectedKey={user.role}>
						<ListItem id={ROLES.viewOnly} data-test="dropdown-item-viewOnly">
							{formatMessage(labels.viewOnly)}
						</ListItem>
						<ListItem id={ROLES.user} data-test="dropdown-item-user">
							{formatMessage(labels.user)}
						</ListItem>
						<ListItem id={ROLES.admin} data-test="dropdown-item-admin">
							{formatMessage(labels.admin)}
						</ListItem>
					</Select>
				</FormField>
			)}
			<FormButtons>
				<FormSubmitButton data-test="button-submit" variant="primary">
					{formatMessage(labels.save)}
				</FormSubmitButton>
			</FormButtons>
		</Form>
	);
}
