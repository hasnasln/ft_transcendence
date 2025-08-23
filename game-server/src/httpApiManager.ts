export interface ApiResult {
	statusCode: number;
    message: string;
    data?: any;
}

export class HTTPMethod extends String {
    public static GET: string = 'GET';
    public static POST: string = 'POST';
    public static PUT: string = 'PUT';
    public static DELETE: string = 'DELETE';
    public static PATCH: string = 'PATCH';
}

export function tournamentApiCall(endpoint: string, method: string, headers?: HeadersInit, body?: BodyInit, token?: string): Promise<ApiResult | Error> {
	const url = process.env.TOURNAMENT_SERVICE_URL ?? 'http://tournament.transendence.com';
	headers = headers || {};
	return apiCall(`${url}/api/${endpoint}`, method, {
		...headers,
		'Content-Type': 'application/json',
		"x-api-key": process.env.X_API_KEY ?? "bypassauth",
	}, body, token);
}

export async function apiCall(url: string, method: string, headers: HeadersInit, body?: BodyInit, token?: string): Promise<ApiResult | Error> {
	const options: RequestInit = {
		method,
		headers: {
			...headers,
			Authorization: token ? `Bearer ${token}` : '',
		},
	};
	if (body) {
		options.body = body;
	}
	console.log("options", options);
	console.log("url", url);

	const response = await fetch(url, options);
	const contentType = response.headers.get('Content-Type') || '';
	if (contentType.includes('application/json')) {
		let responseBody;
		try {
			responseBody = await response.json();
		} catch (error) {
			console.error('Error in fetch:', error);
			return error as Error;
		}
		return { statusCode: response.status, message: response.ok ? responseBody.message : responseBody.error, data: responseBody.data } satisfies ApiResult;
	} else {
		const text = await response.text();
		return { statusCode: -1, message: text, data: null } satisfies ApiResult;
	}
}