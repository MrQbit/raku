# RAKU - Pending Implementation Tasks

## 🚨 **HIGH PRIORITY - MCP Factory Implementation**

### 1. Landing Zone Configuration & Database Schema
**Status**: 🔄 **IN PROGRESS** - Core MCP Factory functionality

**Requirements**:
- Add `LandingZone` table to Prisma schema
- Add `McpServerDeployment` table to track deployments
- Environment variable configuration for multiple clusters
- Landing zone management API endpoints

**Files to create/modify**:
- `services/api/prisma/schema.prisma` - Add new tables
- `services/api/src/usecases/landingZones.ts` - Landing zone CRUD
- `services/api/src/usecases/deployments.ts` - Deployment management
- `services/api/src/server.ts` - Add new endpoints

### 2. Docker Image Generation
**Status**: 🔄 **IN PROGRESS** - Containerization for MCP servers

**Requirements**:
- Generate Dockerfile from pack definitions
- Build Docker images with selected packs
- Push to configurable container registries
- Support for multiple base images and configurations

**Files to create/modify**:
- `services/api/src/usecases/dockerGeneration.ts` - Docker build logic
- `services/api/src/server.ts` - Add deployment endpoints

### 3. Kubernetes Deployment
**Status**: 🔄 **IN PROGRESS** - Container orchestration

**Requirements**:
- Generate Kubernetes manifests (Deployment, Service, Namespace)
- Deploy to configurable landing zones
- Health checking and monitoring
- Resource management and scaling

**Files to create/modify**:
- `services/api/src/usecases/kubernetes.ts` - K8s deployment logic
- `services/api/src/server.ts` - Add deployment endpoints

### 4. Enhanced Pack Management UI
**Status**: 🔄 **IN PROGRESS** - Complete MCP Factory workflow

**Requirements**:
- API analysis interface
- Pack selection and deployment UI
- Landing zone selection
- Deployment status monitoring
- Real-time deployment logs

**Files to modify**:
- `apps/ui-packs/src/App.tsx` - Add deployment functionality
- Add new components for deployment workflow

### 5. API Analysis & Pack Generation
**Status**: 🔄 **IN PROGRESS** - Intelligent pack creation

**Requirements**:
- Enhance Azure OpenAI assistant for pack generation
- API analysis workflow in UI
- Pack definition templates
- Validation and testing utilities

**Files to create/modify**:
- `services/api/src/usecases/packGeneration.ts` - Pack creation logic
- `apps/ui-packs/src/App.tsx` - Add API analysis interface

## 🚨 **High Priority - Core Functionality**

### 6. Database Integration (services/api/src/usecases/*)
**Status**: ✅ **COMPLETED** - All mock data replaced with actual Prisma queries

**Files completed**:
- ✅ `src/usecases/servers.ts` - Using Prisma queries for server data
- ✅ `src/usecases/packs.ts` - Using Prisma queries for pack data  
- ✅ `src/usecases/policies.ts` - Using Prisma queries for policy data
- ✅ `src/usecases/traces.ts` - Using Prisma queries for trace data
- ✅ `src/usecases/jobs.ts` - **NEW** - Implemented full async job management with Prisma
- ✅ `src/usecases/thirdparty.ts` - Using Prisma queries for third-party MCP data
- ✅ `src/domain/routing.ts` - Implemented intelligent route lookup from database
- ✅ `src/domain/tracing.ts` - Implemented trace persistence to database

**New Features Added**:
- Full CRUD operations for async jobs (`POST /v1/jobs`, `PUT /v1/jobs/:id`)
- Intelligent route resolution (internal routes → third-party MCP fallback)
- Comprehensive trace persistence with sensitive data redaction

### 7. Policy Engine Implementation
**Status**: ✅ **COMPLETED** - Basic RBAC/ABAC enforcement implemented

**Files completed**:
- ✅ `src/domain/policy.ts` - Implemented RBAC/ABAC enforcement logic with database integration
- ✅ `src/usecases/policies.ts` - Already using Prisma queries

**Features Implemented**:
- ✅ Role-based access control (RBAC) with wildcard pattern matching
- ✅ Attribute-based access control (ABAC) with constraint evaluation
- ✅ Environment-based policy enforcement
- ✅ Intent pattern matching with wildcard support
- ✅ Database-driven policy evaluation

**Remaining Work**:
- 🔄 Approval workflows for sensitive operations (logging only, needs full implementation)
- 🔄 Policy validation and testing

### 8. Route Resolution Logic
**Status**: ✅ **COMPLETED** - Intelligent route resolution implemented

**Files completed**:
- ✅ `src/domain/routing.ts` - Implemented intelligent route selection with database integration

**Features Implemented**:
- ✅ Database queries for internal routes (Route table)
- ✅ Fallback to third-party MCP capability matching
- ✅ Environment-based routing (dev/staging/prod)
- ✅ Version preference handling
- ✅ Error handling for missing routes

**Remaining Work**:
- 🔄 Load balancing and failover logic for multiple route candidates
- 🔄 Health checking for route targets

## 🔧 **Medium Priority - UI Applications**

### 4. Complete UI Applications
**Status**: Most UI apps are placeholder implementations

**Apps to complete**:
- `apps/ui-server/` - Server management interface
- `apps/ui-packs/` - Pack builder and management UI
- `apps/ui-policy/` - Policy configuration interface
- `apps/ui-obs/` - Observability dashboard
- `apps/ui-a2a/` - Agent-to-agent console

**Requirements**:
- CRUD operations for each domain
- Real-time updates
- Form validation
- Error handling

### 5. Pack Builder CLI
**Status**: Only skeleton exists

**Files to implement**:
- `packages/pack-builder/src/cli.ts` - Main CLI entry point
- Code generation for pack definitions from API specs
- Validation and testing utilities

## 🏢 **Lower Priority - Enterprise Features**

### 6. Advanced Enterprise Features
**Status**: Infrastructure exists but integration needed

**Components**:
- **OpenTelemetry Integration**: Full tracing and metrics collection
- **Redis Caching**: Performance optimization layer
- **Kafka Integration**: Async job processing and event streaming
- **ClickHouse Analytics**: Real-time metrics and reporting
- **Authentication**: JWT/OIDC implementation
- **Rate Limiting**: API throttling and quota management

### 7. Multi-tenant Support
**Status**: Not implemented

**Requirements**:
- Tenant isolation at database level
- Per-tenant configuration
- Tenant-specific routing and policies

## 🧪 **Testing & Quality**

### 8. Test Coverage
**Status**: No tests implemented

**Requirements**:
- Unit tests for use cases and domain logic
- Integration tests for API endpoints
- End-to-end tests for UI workflows
- Performance tests for routing logic

### 9. Error Handling & Validation
**Status**: Basic implementation exists

**Improvements needed**:
- Comprehensive error responses
- Input validation at all layers
- Graceful degradation for external services
- Circuit breaker patterns for third-party MCPs

## 📚 **Documentation & Developer Experience**

### 10. API Documentation
**Status**: Basic README exists

**Requirements**:
- OpenAPI/Swagger documentation
- Interactive API explorer
- SDK generation for multiple languages
- Integration examples and tutorials

### 11. Monitoring & Observability
**Status**: Basic logging exists

**Requirements**:
- Health check endpoints
- Metrics collection and dashboards
- Alerting for system failures
- Performance monitoring

---

## 🎯 **Recommended Implementation Order**

1. **MCP Factory Core** - Landing zones, Docker generation, K8s deployment
2. **Enhanced Pack UI** - Complete MCP Factory workflow in UI
3. **API Analysis & Pack Generation** - Intelligent pack creation
4. **Database Integration** - Foundation for all other features ✅
5. **Policy Engine** - Core security functionality ✅
6. **Route Resolution** - Intelligent routing logic ✅
7. **UI Applications** - User-facing functionality
8. **Pack Builder CLI** - Developer tooling
9. **Enterprise Features** - Production readiness
10. **Testing & Documentation** - Quality and maintainability

## 📝 **Notes**

- All mock data should be replaced with actual database operations
- Maintain backward compatibility during transitions
- Add comprehensive error handling and logging
- Follow the existing architecture patterns and TypeScript contracts
- Ensure all changes are properly tested before deployment
