import { ApiError } from "@/lib/api-error";

/**
 * Validates a custom endpoint URL to protect Nullback against Server-Side Request Forgery (SSRF).
 *
 * Enforces:
 * 1. Protocol allowlist (HTTP/HTTPS only; blocks file://, ftp://, gopher://, etc.)
 * 2. Loopback blocking (localhost, 127.0.0.1, ::1)
 * 3. Cloud metadata endpoint blocking (169.254.169.254, metadata.google.internal)
 * 4. RFC 1918 private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * 5. Link-local and Carrier-Grade NAT ranges
 * 6. IPv6 private/unique-local ranges (fc00::/7, fe80::/10)
 *
 * @param {string} urlString - Custom endpoint URL provided by the developer
 * @returns {string} Sanitized URL string
 */
export function validateCustomEndpointUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    throw new ApiError(400, "Endpoint URL is required");
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch (err) {
    throw new ApiError(400, "Invalid endpoint URL format");
  }

  // 1. Protocol validation
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiError(
      400,
      `Invalid URL protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject reserved internal and cloud metadata hostnames
  const forbiddenHostnames = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "metadata.google.internal",
    "instance-data",
  ];

  if (forbiddenHostnames.includes(hostname)) {
    throw new ApiError(
      400,
      "Invalid endpoint: loopback and internal hostnames are prohibited"
    );
  }

  if (
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost")
  ) {
    throw new ApiError(
      400,
      "Invalid endpoint: internal and local domain names are prohibited"
    );
  }

  // 3. Inspect IPv4 addresses for private / internal subnets
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);

  if (match) {
    const octets = match.slice(1).map(Number);

    if (octets.some((o) => o < 0 || o > 255)) {
      throw new ApiError(400, "Invalid IPv4 address format");
    }

    const [a, b] = octets;

    // Loopback: 127.0.0.0/8
    if (a === 127) {
      throw new ApiError(
        400,
        "Invalid endpoint: loopback IP addresses are prohibited"
      );
    }

    // Zero address: 0.0.0.0/8
    if (a === 0) {
      throw new ApiError(
        400,
        "Invalid endpoint: non-routable IP addresses are prohibited"
      );
    }

    // RFC 1918 Private: 10.0.0.0/8
    if (a === 10) {
      throw new ApiError(
        400,
        "Invalid endpoint: private network IP addresses (10.0.0.0/8) are prohibited"
      );
    }

    // RFC 1918 Private: 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) {
      throw new ApiError(
        400,
        "Invalid endpoint: private network IP addresses (172.16.0.0/12) are prohibited"
      );
    }

    // RFC 1918 Private: 192.168.0.0/16
    if (a === 192 && b === 168) {
      throw new ApiError(
        400,
        "Invalid endpoint: private network IP addresses (192.168.0.0/16) are prohibited"
      );
    }

    // Link-local / Cloud Metadata: 169.254.0.0/16 (e.g. AWS/GCP 169.254.169.254)
    if (a === 169 && b === 254) {
      throw new ApiError(
        400,
        "Invalid endpoint: cloud metadata and link-local IP addresses are prohibited"
      );
    }

    // Carrier Grade NAT: 100.64.0.0/10
    if (a === 100 && b >= 64 && b <= 127) {
      throw new ApiError(
        400,
        "Invalid endpoint: shared network IP addresses are prohibited"
      );
    }
  }

  // 4. Inspect IPv6 addresses for loopback / private ranges
  if (hostname.startsWith("[") || hostname.includes(":")) {
    const rawIpv6 = hostname.replace(/^\[|\]$/g, "");
    if (
      rawIpv6 === "::1" ||
      rawIpv6 === "::" ||
      rawIpv6.startsWith("fe80:") ||
      rawIpv6.startsWith("fc") ||
      rawIpv6.startsWith("fd")
    ) {
      throw new ApiError(
        400,
        "Invalid endpoint: IPv6 private or loopback addresses are prohibited"
      );
    }
  }

  return parsed.toString();
}

