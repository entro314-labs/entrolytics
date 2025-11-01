import { NextResponse } from "next/server";
import { notFound } from "@/lib/response";
import { findLinkBySlug } from "@/queries";
import { POST } from "@/app/api/send/route";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	const link = await findLinkBySlug(slug);

	if (!link) {
		return notFound();
	}

	const payload = {
		type: "event",
		payload: {
			link: link.linkId, // FIX: use link.linkId instead of link.id
			url: request.url,
			referrer: request.referrer,
		},
	};

	const req = new Request(request.url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	await POST(req);

	return NextResponse.redirect(link.url);
}
