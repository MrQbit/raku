# RAKU API Authentication Guide

## 🔑 **How to Obtain a Valid API Key**

### **Option 1: Development Mode (No Authentication)**
By default, RAKU runs in development mode with **no authentication required**. You can access all endpoints without any API key:

```bash
curl http://localhost:8080/v1/servers
curl http://localhost:8080/v1/packs
curl http://localhost:8080/v1/landing-zones
```

### **Option 2: Generate an API Key**
To get an API key, use the built-in key generator:

```bash
curl http://localhost:8080/v1/auth/generate-key
```

This will return:
```json
{
  "apiKey": "raku-w1gjxjqpv6boxhcikfs8ng",
  "usage": {
    "curl": "curl -H \"Authorization: Bearer raku-w1gjxjqpv6boxhcikfs8ng\" http://localhost:8080/v1/servers",
    "header": "X-API-Key: raku-w1gjxjqpv6boxhcikfs8ng",
    "env": "RAKU_API_KEY=raku-w1gjxjqpv6boxhcikfs8ng"
  }
}
```

### **Option 3: Enable Production Authentication**
To enable API key authentication in production:

1. **Set the environment variable:**
   ```bash
   export RAKU_API_KEY=your-generated-api-key-here
   ```

2. **Or create a `.env` file in `services/api/`:**
   ```env
   RAKU_API_KEY=raku-w1gjxjqpv6boxhcikfs8ng
   ```

3. **Restart the API server:**
   ```bash
   cd services/api && pnpm dev
   ```

## 🔐 **How to Use API Keys**

### **Method 1: Bearer Token (Recommended)**
```bash
curl -H "Authorization: Bearer raku-w1gjxjqpv6boxhcikfs8ng" \
     http://localhost:8080/v1/servers
```

### **Method 2: X-API-Key Header**
```bash
curl -H "X-API-Key: raku-w1gjxjqpv6boxhcikfs8ng" \
     http://localhost:8080/v1/servers
```

### **Method 3: Environment Variable (for server-side)**
```bash
export RAKU_API_KEY=raku-w1gjxjqpv6boxhcikfs8ng
curl http://localhost:8080/v1/servers
```

## 🧪 **Testing Authentication**

### **Check Server Status**
```bash
curl http://localhost:8080/health
```

### **Test with Valid Key**
```bash
curl -H "Authorization: Bearer raku-w1gjxjqpv6boxhcikfs8ng" \
     http://localhost:8080/v1/servers
```

### **Test with Invalid Key**
```bash
curl -H "Authorization: Bearer invalid-key" \
     http://localhost:8080/v1/servers
```

## 🔧 **Integration Examples**

### **JavaScript/Node.js**
```javascript
const apiKey = 'raku-w1gjxjqpv6boxhcikfs8ng';
const response = await fetch('http://localhost:8080/v1/servers', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});
```

### **Python**
```python
import requests

api_key = 'raku-w1gjxjqpv6boxhcikfs8ng'
headers = {'Authorization': f'Bearer {api_key}'}
response = requests.get('http://localhost:8080/v1/servers', headers=headers)
```

### **TypeScript (for your agents)**
```typescript
const API_KEY = process.env.RAKU_API_KEY || 'raku-w1gjxjqpv6boxhcikfs8ng';
const response = await fetch('http://localhost:8080/v1/route/execute', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    intent: 'sample.math.add',
    inputs: { a: 5, b: 3 },
    context: { env: 'prod' }
  })
});
```

## 🚨 **Security Notes**

1. **Development Mode**: Authentication is disabled by default for development
2. **Production Mode**: Set `RAKU_API_KEY` environment variable to enable authentication
3. **Key Rotation**: Generate new keys regularly using `/v1/auth/generate-key`
4. **Secure Storage**: Store API keys in environment variables, not in code
5. **HTTPS**: Use HTTPS in production to protect API keys in transit

## 📝 **Current Status**

- ✅ **Authentication middleware implemented**
- ✅ **API key generation endpoint available**
- ✅ **Development mode (no auth required)**
- ✅ **Production mode (auth required when `RAKU_API_KEY` is set)**
- ✅ **Multiple authentication methods supported**

## 🎯 **Quick Start**

1. **Get an API key:**
   ```bash
   curl http://localhost:8080/v1/auth/generate-key
   ```

2. **Test the key:**
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        http://localhost:8080/v1/servers
   ```

3. **Enable production auth (optional):**
   ```bash
   export RAKU_API_KEY=YOUR_API_KEY
   # Restart server
   ```

