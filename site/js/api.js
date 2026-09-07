const API_BASE_URL = 'https://localhost:7001/api'; // Укажи свой URL ASP.NET Core API

export { API_BASE_URL };

export async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            // Callers need more than the status line: the verification flow
            // reads `attemptsLeft` and `retryAfterSeconds` out of the body, and
            // it tells an answering server apart from an absent one by whether
            // `status` is set at all. A network failure never gets this far.
            let body = null;
            try {
                body = await response.json();
            } catch (parseError) {
                body = null; // an error page, or an empty body
            }

            const error = new Error(`Ошибка API: ${response.status}`);
            error.status = response.status;
            error.body = body;
            throw error;
        }

        // 204 No Content has no body to parse.
        if (response.status === 204) return null;

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
