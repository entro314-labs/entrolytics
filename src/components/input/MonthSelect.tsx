import { Row, Select, ListItem } from "@entro314labs/entro-zen";
import { useLocale } from "@/components/hooks";
import { formatDate } from "@/lib/date";

export function MonthSelect({ date = new Date(), onChange }) {
	const { locale } = useLocale();
	const month = date.getMonth();
	const year = date.getFullYear();
	const currentYear = new Date().getFullYear();

	const months = [...Array(12)].map((_, i) => i);
	const years = [...Array(10)].map((_, i) => currentYear - i);

	const handleMonthChange = (month: number) => {
		const d = new Date(date);
		d.setMonth(month);
		onChange?.(d);
	};
	const handleYearChange = (year: number) => {
		const d = new Date(date);
		d.setFullYear(year);
		onChange?.(d);
	};

	return (
		<Row gap>
			<Select value={month} onChange={handleMonthChange} aria-label="Month">
				{months.map((m) => {
					return (
						<ListItem id={m} key={m}>
							{formatDate(new Date(year, m, 1), "MMMM", locale)}
						</ListItem>
					);
				})}
			</Select>
			<Select value={year} onChange={handleYearChange} aria-label="Year">
				{years.map((y) => {
					return (
						<ListItem id={y} key={y}>
							{y}
						</ListItem>
					);
				})}
			</Select>
		</Row>
	);
}
