import { Row, Column, Text } from '@entro314labs/entro-zen';

export function ActionForm({ label, description, children }) {
  return (
    <Row padding="6" border borderRadius="3" justifyContent="space-between" shadow="2">
      <Column>
        <Text weight="bold">{label}</Text>
        <Text>{description}</Text>
      </Column>
      <Row gap="3" alignItems="center">
        {children}
      </Row>
    </Row>
  );
}
