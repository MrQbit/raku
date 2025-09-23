import prisma from "../db/client";
export async function enforcePolicies({ intent, context, route }) {
    // Get all active policies
    const policies = await prisma.policy.findMany();
    if (policies.length === 0) {
        // No policies defined, allow by default
        return true;
    }
    // Check each policy
    for (const policy of policies) {
        const rbac = policy.rbacJson;
        const abac = policy.abacJson;
        const approvals = policy.approvalsJson;
        // RBAC Check - check if user role has permission for this intent
        if (rbac && rbac.grants) {
            const userRole = context?.role || "anonymous";
            const hasPermission = rbac.grants.some((grant) => {
                const roleMatch = grant.role === userRole || grant.role === "*";
                const intentMatch = intentMatchesPattern(intent, grant.intentPattern);
                const envMatch = !grant.env || grant.env === context?.env;
                const actionMatch = !grant.actions || grant.actions.includes("execute");
                return roleMatch && intentMatch && envMatch && actionMatch;
            });
            if (!hasPermission) {
                throw new Error(`Access denied: Role '${userRole}' does not have permission to execute intent '${intent}'`);
            }
        }
        // ABAC Check - check attribute-based constraints
        if (abac && abac.constraints) {
            for (const constraint of abac.constraints) {
                const contextValue = context?.[constraint.key];
                const constraintSatisfied = evaluateConstraint(contextValue, constraint.op, constraint.value);
                if (!constraintSatisfied) {
                    throw new Error(`Access denied: Constraint '${constraint.key} ${constraint.op} ${constraint.value}' not satisfied`);
                }
            }
        }
        // Approval Check - check if intent requires approval
        if (approvals && approvals.length > 0) {
            const requiresApproval = approvals.some((approval) => intentMatchesPattern(intent, approval.intentPattern));
            if (requiresApproval) {
                // For now, we'll just log this - in a real system you'd check for existing approvals
                console.log(`Intent '${intent}' requires approval from approver group`);
                // TODO: Implement approval checking logic
            }
        }
    }
    return true;
}
function intentMatchesPattern(intent, pattern) {
    if (pattern === "*")
        return true;
    if (pattern === intent)
        return true;
    // Simple wildcard matching - convert * to regex
    const regexPattern = pattern.replace(/\*/g, ".*");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(intent);
}
function evaluateConstraint(value, op, expectedValue) {
    switch (op) {
        case "eq": return value === expectedValue;
        case "neq": return value !== expectedValue;
        case "lte": return Number(value) <= Number(expectedValue);
        case "gte": return Number(value) >= Number(expectedValue);
        case "in": return Array.isArray(expectedValue) && expectedValue.includes(value);
        case "nin": return Array.isArray(expectedValue) && !expectedValue.includes(value);
        default: return false;
    }
}
