import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseRequest } from "@/lib/request";
import { unauthorized, badRequest, json } from "@/lib/response";

const proxySchema = z.object({
	url: z.string().url("Invalid URL provided"),
	method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET"),
	headers: z.record(z.string(), z.string()).optional(),
	body: z.any().optional(),
});

export async function POST(request: NextRequest) {
	try {
		const { auth, body, error } = await parseRequest(request, proxySchema);

		if (error) {
			return error();
		}

		// Only authenticated users can use the proxy
		if (!auth?.user) {
			return unauthorized();
		}

		const { url, method, headers: customHeaders, body: requestBody } = body;

		// Security: Only allow HTTPS URLs and specific domains if needed
		const urlObj = new URL(url);
		if (urlObj.protocol !== "https:") {
			return badRequest("Only HTTPS URLs are allowed");
		}

		// Optional: Add domain whitelist for additional security
		// const allowedDomains = ['example.com', 'api.example.com']
		// if (!allowedDomains.includes(urlObj.hostname)) {
		//   return badRequest('Domain not allowed')
		// }

		// Prepare headers
		const proxyHeaders: HeadersInit = {
			"User-Agent": "Entrolytics-Analytics/1.0",
			Accept: "application/json, text/plain, */*",
			...customHeaders,
		};

		// Remove potentially problematic headers
		delete proxyHeaders["host"];
		delete proxyHeaders["origin"];
		delete proxyHeaders["referer"];

		// Make the proxied request
		const proxyResponse = await fetch(url, {
			method,
			headers: proxyHeaders,
			body: requestBody ? JSON.stringify(requestBody) : undefined,
			// Add timeout to prevent hanging requests
			signal: AbortSignal.timeout(10000), // 10 second timeout
		});

		// Get response data
		const responseText = await proxyResponse.text();
		let responseData: any;

		// Try to parse as JSON, fallback to text
		try {
			responseData = JSON.parse(responseText);
		} catch {
			responseData = responseText;
		}

		// Return the proxied response
		return new NextResponse(
			JSON.stringify({
				status: proxyResponse.status,
				statusText: proxyResponse.statusText,
				headers: Object.fromEntries(proxyResponse.headers.entries()),
				data: responseData,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.error("Proxy error:", error);

		if (error instanceof Error && error.name === "AbortError") {
			return new NextResponse(
				JSON.stringify({
					error: "Request timeout",
					message: "The external request timed out",
				}),
				{
					status: 408,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return new NextResponse(
			JSON.stringify({
				error: "Proxy error",
				message:
					error instanceof Error ? error.message : "Failed to proxy request",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}

// Also support GET for simple proxy requests with URL in query params
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const url = searchParams.get("url");

		if (!url) {
			return badRequest("URL parameter is required");
		}

		// Reuse POST logic by creating a mock body
		const mockRequest = new Request(request.url, {
			method: "POST",
			headers: request.headers,
			body: JSON.stringify({
				url,
				method: "GET",
			}),
		});

		return POST(mockRequest as NextRequest);
	} catch (error) {
		console.error("Proxy GET error:", error);
		return new NextResponse(
			JSON.stringify({
				error: "Proxy error",
				message: "Failed to process GET proxy request",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
