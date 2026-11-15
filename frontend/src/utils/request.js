// Bound both the connection and response-body read, including downloads.
export async function readHttp(
  url,
  options = {},
  { timeoutMs = 45000, format = "json" } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const data =
      format === "blob" ? await response.blob() : await response.json();
    return { response, data };
  } catch (error) {
    throw {
      code: controller.signal.aborted
        ? "REQUEST_TIMEOUT"
        : "SERVICE_UNAVAILABLE",
    };
  } finally {
    clearTimeout(timer);
  }
}
