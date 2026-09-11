export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns");
    // Node's fetch (undici) can intermittently fail against Google's API
    // when IPv6 is attempted first on networks with flaky IPv6 routing.
    dns.setDefaultResultOrder("ipv4first");
  }
}
