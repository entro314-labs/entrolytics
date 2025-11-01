import { useLoginQuery, useMessages, useModified } from "@/components/hooks";
import { useRouter } from "next/navigation";
import {
	Button,
	Icon,
	Modal,
	DialogTrigger,
	Dialog,
	Text,
} from "@entro314labs/entro-zen";
import { LogOut } from "@/components/icons";
import { OrgLeaveForm } from "./OrgLeaveForm";

export function OrgLeaveButton({
	orgId,
	orgName,
}: {
	orgId: string;
	orgName: string;
}) {
	const { formatMessage, labels } = useMessages();
	const router = useRouter();
	const { user } = useLoginQuery();
	const { touch } = useModified();

	const handleLeave = async () => {
		touch("orgs");
		router.push("/settings/orgs");
	};

	return (
		<DialogTrigger>
			<Button>
				<Icon>
					<LogOut />
				</Icon>
				<Text>{formatMessage(labels.leave)}</Text>
			</Button>
			<Modal>
				<Dialog title={formatMessage(labels.leaveOrg)} style={{ width: 400 }}>
					{({ close }) => (
						<OrgLeaveForm
							orgId={orgId}
							userId={user.id}
							orgName={orgName}
							onSave={handleLeave}
							onClose={close}
						/>
					)}
				</Dialog>
			</Modal>
		</DialogTrigger>
	);
}
