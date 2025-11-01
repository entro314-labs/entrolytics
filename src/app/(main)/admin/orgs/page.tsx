import { Metadata } from "next";
import { AdminOrgsPage } from "./AdminOrgsPage";

export default function () {
	return <AdminOrgsPage />;
}
export const metadata: Metadata = {
	title: "Orgs",
};
