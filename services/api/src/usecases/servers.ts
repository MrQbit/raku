export async function listServers() {
  return [{ id: "00000000-0000-0000-0000-000000000001", name: "billing-mcp", env: "dev", status: "healthy", version: "1.0.0" }];
}
export async function getServer(id: string) {
  return { id, name: "billing-mcp", env: "dev", status: "healthy", version: "1.0.0", endpointBaseUrl: "https://example/api" };
}
