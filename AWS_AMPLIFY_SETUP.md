# AWS Amplify Setup Guide

## Overview
Full AWS Amplify support is now available! You can use AWS AppSync GraphQL API to import and manage your data.

## Prerequisites

1. **AWS Account** with AppSync enabled
2. **GraphQL API** created in AWS AppSync
3. **API Key** generated for your AppSync API
4. **GraphQL Schema** with mutation and query operations

## Configuration Fields

### 1. GraphQL API URL
Your AWS AppSync GraphQL endpoint URL.

**Format:** `https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql`

**How to find:**
1. Go to AWS AppSync Console
2. Select your API
3. Copy the API URL from the Settings tab

### 2. API Key
Your AppSync API authentication key.

**Format:** `da2-xxxxxxxxxxxxxxxxxxxxx`

**How to find:**
1. Go to AWS AppSync Console
2. Select your API
3. Go to Settings → API Keys
4. Copy an existing key or create a new one

### 3. AWS Region (Optional)
The AWS region where your AppSync API is hosted.

**Default:** `us-east-1`

**Common regions:**
- `us-east-1` - US East (N. Virginia)
- `us-west-2` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

### 4. Model/Table Name
The GraphQL type/model name (case-sensitive).

**Example:** `User`, `Product`, `Order`

**Important:** This should match your GraphQL schema type name exactly.

## GraphQL Schema Requirements

Your AppSync schema must have the following operations for the specified model:

### Required Mutations

```graphql
type Mutation {
    # Create operation (single item)
    createUser(input: CreateUserInput!): User
    
    # Delete operation (for purge functionality)
    deleteUser(input: DeleteUserInput!): User
}

input CreateUserInput {
    id: ID!
    # Your custom fields here
    name: String
    email: String
    # ... other fields
}

input DeleteUserInput {
    id: ID!
}
```

### Required Queries

```graphql
type Query {
    # List operation for fetching data
    listUsers(limit: Int): UserConnection
}

type UserConnection {
    items: [User]
    nextToken: String
}

type User {
    id: ID!
    # Your custom fields here
    name: String
    email: String
    # ... other fields
}
```

## Example Configuration

### Using the Settings Modal

1. Open Settings (⚙️ icon in header)
2. Select **AWS Amplify** as provider
3. Fill in the fields:

```
GraphQL API URL: https://abc123def.appsync-api.us-east-1.amazonaws.com/graphql
API Key: da2-xxxxxxxxxxxxxxxxxxxxxxxxx
AWS Region: us-east-1
Model/Table Name: User
```

4. Click **Save AWS Amplify Pipeline**

### Using Code

```typescript
import { DataManager } from './services/db';

const config = {
    provider: 'AWS Amplify',
    amplifyApiUrl: 'https://abc123def.appsync-api.us-east-1.amazonaws.com/graphql',
    amplifyApiKey: 'da2-xxxxxxxxxxxxxxxxxxxxxxxxx',
    amplifyRegion: 'us-east-1',
    collectionName: 'User'
};

// Test connection
const connected = await DataManager.testConnection(config);

// Import data
const data = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' }
];

const result = await DataManager.importData(data, config);
```

## Features Supported

✅ **Connection Testing** - Verify AppSync API connectivity
✅ **Batch Import** - Import CSV data in batches of 100
✅ **Data Fetching** - Retrieve up to 100 records
✅ **Data Purging** - Delete all records
✅ **Progress Tracking** - Real-time import progress

## Limitations

- **Batch Size:** 100 items per batch (AppSync limitation)
- **Fetch Limit:** 100 items max per query
- **Field Types:** Automatic type conversion may be needed
- **ID Generation:** Auto-generated IDs use timestamp

## Troubleshooting

### "Connection Failed"
- Verify your API URL is correct
- Check that API Key is valid and not expired
- Ensure your AppSync API is active

### "Import Failed"
- Check that your GraphQL schema has `create{ModelName}` mutation
- Verify field names match your schema
- Ensure API Key has write permissions

### "Access Denied"
- Check API Key permissions in AppSync
- Verify authentication mode is set to API_KEY
- Review AppSync resolver permissions

## Best Practices

1. **Schema Design:** Use consistent naming conventions
2. **Field Mapping:** Map CSV headers to match GraphQL schema fields
3. **API Keys:** Rotate API keys regularly for security
4. **Batch Size:** Default 100 is optimal for AppSync
5. **Error Handling:** Check result.errors array after import

## Example AppSync Schema

Here's a complete example schema for a User model:

```graphql
type User {
    id: ID!
    name: String!
    email: AWSEmail!
    age: Int
    createdAt: AWSDateTime
}

input CreateUserInput {
    id: ID!
    name: String!
    email: AWSEmail!
    age: Int
    createdAt: AWSDateTime
}

input DeleteUserInput {
    id: ID!
}

type UserConnection {
    items: [User]
    nextToken: String
}

type Mutation {
    createUser(input: CreateUserInput!): User
    deleteUser(input: DeleteUserInput!): User
}

type Query {
    listUsers(limit: Int, nextToken: String): UserConnection
    getUser(id: ID!): User
}
```

## Resources

- [AWS AppSync Documentation](https://docs.aws.amazon.com/appsync/)
- [GraphQL Schema Design](https://graphql.org/learn/schema/)
- [AWS Amplify Guide](https://docs.amplify.aws/)

## Support

For issues or questions:
1. Check the [API_REFERENCE.md](../API_REFERENCE.md)
2. Review [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
3. See AWS AppSync console logs for detailed errors

---

**AWS Amplify is now fully supported!** 🚀
