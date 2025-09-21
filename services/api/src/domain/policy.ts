export async function enforcePolicies({ intent, context, route }: { intent: string; context?: any; route: any }) {
  // TODO: RBAC/ABAC + approvals
  return true;
}
