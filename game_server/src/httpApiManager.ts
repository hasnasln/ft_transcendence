export interface IApiResponseWrapper {
    success: boolean;
    message?: string;
    data?: any; // Data can be of any type, depending on the API response
}

export class HTTPMethod extends String {
    public static GET: string = 'GET';
    public static POST: string = 'POST';
    public static PUT: string = 'PUT';
    public static DELETE: string = 'DELETE';
    public static PATCH: string = 'PATCH';
}

export function apiCall(url: string, method: string, headers: HeadersInit, body?: BodyInit, token?: string): Promise<Response> {
	try {
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
		return fetch(url, options);
	} catch (error) {
		console.error('Error in fetch:', error);
		throw error;
	}
}