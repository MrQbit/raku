#!/usr/bin/env node

/**
 * Simple verification script to test database integration
 * Run with: node test-db-integration.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseIntegration() {
  console.log('🧪 Testing RAKU Database Integration...\n');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Create a test third-party MCP
    console.log('2. Creating test third-party MCP...');
    const testMcp = await prisma.thirdPartyMcp.upsert({
      where: { id: 'test-mcp-001' },
      update: {},
      create: {
        id: 'test-mcp-001',
        name: 'Test MCP Server',
        description: 'Test server for database integration',
        baseUrl: 'http://localhost:9091',
        authType: 'none',
        capabilities: [
          { intent: 'test.echo', verbs: ['action'] },
          { intent: 'test.math.add', verbs: ['action'] }
        ],
        owners: ['test@example.com'],
        env: 'dev',
        status: 'healthy',
        tags: ['test', 'integration']
      }
    });
    console.log('✅ Test MCP created:', testMcp.name);

    // Test 3: Create a test pack
    console.log('3. Creating test pack...');
    const testPack = await prisma.pack.upsert({
      where: { id: 'test-pack-001' },
      update: {},
      create: {
        id: 'test-pack-001',
        namespace: 'test.operations',
        version: '1.0.0',
        intentsJson: [
          { name: 'test.echo', verbs: ['action'], description: 'Echo test' },
          { name: 'test.math.add', verbs: ['action'], description: 'Add two numbers' }
        ],
        errorModel: ['NotFound', 'ValidationFailed'],
        policies: ['default']
      }
    });
    console.log('✅ Test pack created:', testPack.namespace);

    // Test 4: Create a test policy
    console.log('4. Creating test policy...');
    const testPolicy = await prisma.policy.upsert({
      where: { id: 'test-policy-001' },
      update: {},
      create: {
        id: 'test-policy-001',
        name: 'Test Policy',
        description: 'Test policy for database integration',
        rbacJson: {
          roles: ['admin', 'user'],
          grants: [
            {
              role: 'admin',
              intentPattern: '*',
              actions: ['execute', 'discover']
            },
            {
              role: 'user',
              intentPattern: 'test.*',
              actions: ['execute']
            }
          ]
        },
        abacJson: {
          constraints: [
            {
              key: 'env',
              op: 'in',
              value: ['dev', 'staging']
            }
          ]
        }
      }
    });
    console.log('✅ Test policy created:', testPolicy.name);

    // Test 5: Create a test route
    console.log('5. Creating test route...');
    const testRoute = await prisma.route.upsert({
      where: { id: 'test-route-001' },
      update: {},
      create: {
        id: 'test-route-001',
        intent: 'test.echo',
        serverId: 'test-mcp-001',
        packId: 'test-pack-001',
        version: '1.0.0'
      }
    });
    console.log('✅ Test route created for intent:', testRoute.intent);

    // Test 6: Create a test async job
    console.log('6. Creating test async job...');
    const testJob = await prisma.asyncJob.create({
      data: {
        id: 'test-job-001',
        owner: 'test-user',
        status: 'pending',
        payloadJson: { intent: 'test.echo', inputs: { text: 'hello' } }
      }
    });
    console.log('✅ Test job created:', testJob.id);

    // Test 7: Create a test trace
    console.log('7. Creating test trace...');
    const testTrace = await prisma.trace.create({
      data: {
        id: 'test-trace-001',
        agentId: 'test-agent',
        intent: 'test.echo',
        routeJson: { intent: 'test.echo', target: { serverId: 'test-mcp-001', packId: 'test-pack-001', version: '1.0.0' } },
        inputRedacted: { text: 'hello' },
        outputRedacted: { echoed: 'hello' },
        latencyMs: 150,
        status: 'ok'
      }
    });
    console.log('✅ Test trace created:', testTrace.id);

    // Test 8: Query all test data
    console.log('\n8. Verifying data integrity...');
    const [mcps, packs, policies, routes, jobs, traces] = await Promise.all([
      prisma.thirdPartyMcp.count({ where: { id: 'test-mcp-001' } }),
      prisma.pack.count({ where: { id: 'test-pack-001' } }),
      prisma.policy.count({ where: { id: 'test-policy-001' } }),
      prisma.route.count({ where: { id: 'test-route-001' } }),
      prisma.asyncJob.count({ where: { id: 'test-job-001' } }),
      prisma.trace.count({ where: { id: 'test-trace-001' } })
    ]);

    console.log(`✅ Found ${mcps} test MCP(s)`);
    console.log(`✅ Found ${packs} test pack(s)`);
    console.log(`✅ Found ${policies} test policy(s)`);
    console.log(`✅ Found ${routes} test route(s)`);
    console.log(`✅ Found ${jobs} test job(s)`);
    console.log(`✅ Found ${traces} test trace(s)`);

    console.log('\n🎉 All database integration tests passed!');
    console.log('\n📝 Next steps:');
    console.log('- Test the API endpoints with: curl http://localhost:8080/v1/servers');
    console.log('- Test intent execution with the sample MCP server');
    console.log('- Verify policy enforcement with different roles');

  } catch (error) {
    console.error('❌ Database integration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseIntegration();
