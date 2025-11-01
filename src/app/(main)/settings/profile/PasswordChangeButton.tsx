import { Button, Icon, Text } from "@entro314labs/entro-zen";
import { Settings } from "@/components/icons";
import { useMessages } from "@/components/hooks";
import { useClerk } from "@clerk/nextjs";

export function PasswordChangeButton() {
	const { formatMessage, labels } = useMessages();
	const { openUserProfile } = useClerk();

	const handleManageAccount = () => {
		// Open Clerk's user profile modal for account management
		openUserProfile({
			appearance: { elements: { rootBox: { zIndex: 9999 } } },
		});
	};

	return (
		<Button onPress={handleManageAccount}>
			<Icon>
				<Settings />
			</Icon>
			<Text>{formatMessage(labels.changePassword)}</Text>
		</Button>
	);
}
