import { Row, Text } from "@entro314labs/entro-zen";
import { CURRENT_VERSION, HOMEPAGE_URL } from "@/lib/constants";

export function Footer() {
	return (
		<Row as="footer">
			<a href={HOMEPAGE_URL} target="_blank">
				<Text weight="bold">entrolytics</Text> {`v${CURRENT_VERSION}`}
			</a>
		</Row>
	);
}
