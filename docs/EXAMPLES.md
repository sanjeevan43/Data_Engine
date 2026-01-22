# Database Concepts - Practical Examples

This document shows real-world examples of using Primary Keys, Foreign Keys, and normalization in the CSV Importer.

## Example 1: Simple User Import (Auto-Generated PK)

### CSV File: `users.csv`
```csv
name,email,age,status
John Doe,john@example.com,30,active
Jane Smith,jane@example.com,25,active
Bob Johnson,bob@example.com,35,inactive
```

### Schema Configuration
```typescript
import { CollectionSchema, PrimaryKeyConfig } from './types/schema';

const userSchema: CollectionSchema = {
  collectionName: 'users',
  displayName: 'Users',
  
  // Auto-generated primary key
  primaryKey: {
    type: 'auto',
    validateUniqueness: true
  },
  
  fields: [
    {
      name: 'name',
      type: 'string',
      required: true,
      unique: false
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true, // Emails must be unique
      validation: {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      }
    },
    {
      name: 'age',
      type: 'integer',
      required: true,
      unique: false,
      validation: {
        min: 0,
        max: 150
      }
    },
    {
      name: 'status',
      type: 'string',
      required: true,
      unique: false,
      validation: {
        enum: ['active', 'inactive', 'pending', 'suspended']
      }
    }
  ],
  
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
};
```

### Import Code
```typescript
import { SchemaValidator } from './services/validators/SchemaValidator';
import { db } from './firebase';

async function importUsers(csvData: any[]) {
  // Validate data
  const validation = await SchemaValidator.validate(csvData, userSchema, db);
  
  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    return;
  }
  
  // Import to Firebase
  for (const row of csvData) {
    await addDoc(collection(db, 'users'), {
      name: row.name,
      email: row.email,
      age: parseInt(row.age),
      status: row.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}
```

---

## Example 2: E-commerce System (PK + FK)

### CSV Files

**customers.csv**
```csv
customer_id,name,email,phone
C001,John Doe,john@example.com,555-1234
C002,Jane Smith,jane@example.com,555-5678
C003,Bob Johnson,bob@example.com,555-9012
```

**products.csv**
```csv
product_id,name,price,category
P001,Laptop,999.99,Electronics
P002,Mouse,25.99,Electronics
P003,Desk Chair,199.99,Furniture
```

**orders.csv**
```csv
order_id,customer_id,product_id,quantity,order_date
O001,C001,P001,1,2024-01-15
O002,C001,P002,2,2024-01-16
O003,C002,P003,1,2024-01-17
O004,C003,P001,1,2024-01-18
```

### Schema Configurations

**Customer Schema**
```typescript
const customerSchema: CollectionSchema = {
  collectionName: 'customers',
  
  primaryKey: {
    type: 'csv-column',
    columnName: 'customer_id',
    validateUniqueness: true
  },
  
  fields: [
    {
      name: 'customer_id',
      type: 'string',
      required: true,
      unique: true,
      isPrimaryKey: true
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      unique: false
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true
    },
    {
      name: 'phone',
      type: 'phone',
      required: false,
      unique: false
    }
  ]
};
```

**Product Schema**
```typescript
const productSchema: CollectionSchema = {
  collectionName: 'products',
  
  primaryKey: {
    type: 'csv-column',
    columnName: 'product_id',
    validateUniqueness: true
  },
  
  fields: [
    {
      name: 'product_id',
      type: 'string',
      required: true,
      unique: true,
      isPrimaryKey: true
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      unique: false
    },
    {
      name: 'price',
      type: 'float',
      required: true,
      unique: false,
      validation: {
        min: 0
      }
    },
    {
      name: 'category',
      type: 'string',
      required: true,
      unique: false
    }
  ]
};
```

**Order Schema (with Foreign Keys)**
```typescript
const orderSchema: CollectionSchema = {
  collectionName: 'orders',
  
  primaryKey: {
    type: 'csv-column',
    columnName: 'order_id',
    validateUniqueness: true
  },
  
  fields: [
    {
      name: 'order_id',
      type: 'string',
      required: true,
      unique: true,
      isPrimaryKey: true
    },
    {
      name: 'customer_id',
      type: 'string',
      required: true,
      unique: false,
      isForeignKey: true,
      foreignKeyConfig: {
        sourceColumn: 'customer_id',
        targetCollection: 'customers',
        targetPrimaryKey: 'customer_id',
        onDelete: 'restrict', // Can't delete customer with orders
        onUpdate: 'cascade',  // Update all orders if customer ID changes
        required: true,
        validateReferences: true
      }
    },
    {
      name: 'product_id',
      type: 'string',
      required: true,
      unique: false,
      isForeignKey: true,
      foreignKeyConfig: {
        sourceColumn: 'product_id',
        targetCollection: 'products',
        targetPrimaryKey: 'product_id',
        onDelete: 'restrict',
        onUpdate: 'cascade',
        required: true,
        validateReferences: true
      }
    },
    {
      name: 'quantity',
      type: 'integer',
      required: true,
      unique: false,
      validation: {
        min: 1
      }
    },
    {
      name: 'order_date',
      type: 'date',
      required: true,
      unique: false
    }
  ],
  
  foreignKeys: [
    {
      sourceColumn: 'customer_id',
      targetCollection: 'customers',
      targetPrimaryKey: 'customer_id',
      onDelete: 'restrict',
      onUpdate: 'cascade',
      required: true,
      validateReferences: true
    },
    {
      sourceColumn: 'product_id',
      targetCollection: 'products',
      targetPrimaryKey: 'product_id',
      onDelete: 'restrict',
      onUpdate: 'cascade',
      required: true,
      validateReferences: true
    }
  ]
};
```

### Import Order (Important!)
```typescript
async function importEcommerceData() {
  // STEP 1: Import customers first (no dependencies)
  console.log('Importing customers...');
  await importCollection(customersCSV, customerSchema);
  
  // STEP 2: Import products (no dependencies)
  console.log('Importing products...');
  await importCollection(productsCSV, productSchema);
  
  // STEP 3: Import orders last (depends on customers and products)
  console.log('Importing orders...');
  const validation = await SchemaValidator.validate(ordersCSV, orderSchema, db);
  
  if (!validation.valid) {
    console.error('Foreign key violations:', validation.errors);
    // Example error: "Foreign key violation: C999 not found in customers.customer_id"
    return;
  }
  
  await importCollection(ordersCSV, orderSchema);
}
```

---

## Example 3: Composite Primary Key

### CSV File: `enrollments.csv`
```csv
student_id,course_id,semester,grade
S001,CS101,Fall2024,A
S001,CS102,Fall2024,B
S002,CS101,Fall2024,A
S002,CS102,Spring2024,B
```

### Schema with Composite Key
```typescript
const enrollmentSchema: CollectionSchema = {
  collectionName: 'enrollments',
  
  // Composite key: student_id + course_id + semester
  primaryKey: {
    type: 'composite',
    compositeColumns: ['student_id', 'course_id', 'semester'],
    compositeSeparator: '_',
    validateUniqueness: true
  },
  
  fields: [
    {
      name: 'student_id',
      type: 'string',
      required: true,
      unique: false,
      isForeignKey: true,
      foreignKeyConfig: {
        sourceColumn: 'student_id',
        targetCollection: 'students',
        targetPrimaryKey: 'student_id',
        onDelete: 'cascade', // Delete enrollments when student is deleted
        onUpdate: 'cascade',
        required: true,
        validateReferences: true
      }
    },
    {
      name: 'course_id',
      type: 'string',
      required: true,
      unique: false,
      isForeignKey: true,
      foreignKeyConfig: {
        sourceColumn: 'course_id',
        targetCollection: 'courses',
        targetPrimaryKey: 'course_id',
        onDelete: 'restrict', // Can't delete course with enrollments
        onUpdate: 'cascade',
        required: true,
        validateReferences: true
      }
    },
    {
      name: 'semester',
      type: 'string',
      required: true,
      unique: false,
      validation: {
        pattern: '^(Fall|Spring|Summer)\\d{4}$'
      }
    },
    {
      name: 'grade',
      type: 'string',
      required: false,
      unique: false,
      validation: {
        enum: ['A', 'B', 'C', 'D', 'F', 'W', 'I']
      }
    }
  ]
};
```

### Import with Composite Key
```typescript
import { PrimaryKeyValidator } from './services/validators/SchemaValidator';

async function importEnrollments(csvData: any[]) {
  // Validate composite key uniqueness
  const pkErrors = PrimaryKeyValidator.validateUniqueness(csvData, enrollmentSchema.primaryKey);
  
  if (pkErrors.length > 0) {
    console.error('Duplicate enrollments found:', pkErrors);
    return;
  }
  
  // Import with composite key as document ID
  for (const row of csvData) {
    const compositeKey = `${row.student_id}_${row.course_id}_${row.semester}`;
    
    await setDoc(doc(db, 'enrollments', compositeKey), {
      student_id: row.student_id,
      course_id: row.course_id,
      semester: row.semester,
      grade: row.grade || null
    });
  }
}
```

---

## Example 4: Normalization in Action

### ❌ Unnormalized Data (Bad)
```csv
order_id,customer_name,customer_email,customer_phone,product_name,product_price,quantity
1,John Doe,john@example.com,555-1234,Laptop,999.99,1
2,John Doe,john@example.com,555-1234,Mouse,25.99,2
3,Jane Smith,jane@example.com,555-5678,Laptop,999.99,1
```

**Problems:**
- Duplicate customer data (John's info repeated)
- If John changes email, must update multiple rows
- If Laptop price changes, must update multiple rows
- Wastes storage space

### ✅ Normalized Data (3NF)

**customers.csv**
```csv
customer_id,name,email,phone
C001,John Doe,john@example.com,555-1234
C002,Jane Smith,jane@example.com,555-5678
```

**products.csv**
```csv
product_id,name,price
P001,Laptop,999.99
P002,Mouse,25.99
```

**orders.csv**
```csv
order_id,customer_id,product_id,quantity
1,C001,P001,1
2,C001,P002,2
3,C002,P001,1
```

**Benefits:**
- No duplicate data
- Easy to update customer/product info
- Maintains data integrity
- Saves storage space

---

## Example 5: Validation Error Handling

```typescript
import { SchemaValidator } from './services/validators/SchemaValidator';

async function importWithValidation(csvData: any[], schema: CollectionSchema) {
  // Validate
  const result = await SchemaValidator.validate(csvData, schema, db);
  
  if (!result.valid) {
    console.log('Validation Summary:');
    console.log(`- Total Rows: ${result.totalRows}`);
    console.log(`- Rows with Errors: ${result.errorRows}`);
    console.log(`- Primary Key Violations: ${result.summary.primaryKeyViolations}`);
    console.log(`- Foreign Key Violations: ${result.summary.foreignKeyViolations}`);
    console.log(`- Data Type Errors: ${result.summary.dataTypeErrors}`);
    console.log(`- Required Field Errors: ${result.summary.requiredFieldErrors}`);
    
    // Show first 10 errors
    console.log('\nFirst 10 Errors:');
    result.errors.slice(0, 10).forEach(error => {
      console.log(`Row ${error.row}, Field "${error.field}": ${error.message}`);
      if (error.suggestedFix) {
        console.log(`  Suggested fix: ${error.suggestedFix}`);
      }
    });
    
    // Ask user if they want to auto-fix
    const autoFix = confirm('Auto-fix errors where possible?');
    if (autoFix) {
      csvData = applyAutoFixes(csvData, result.errors);
    }
    
    return;
  }
  
  // Proceed with import
  console.log('✅ All validations passed! Importing...');
  await importData(csvData, schema);
}

function applyAutoFixes(data: any[], errors: ValidationError[]): any[] {
  const fixedData = [...data];
  
  errors.forEach(error => {
    if (error.suggestedFix !== undefined) {
      const rowIndex = error.row - 1;
      fixedData[rowIndex][error.field] = error.suggestedFix;
    }
  });
  
  return fixedData;
}
```

---

## Example 6: Finding Orphaned Records

```typescript
import { ForeignKeyValidator } from './services/validators/SchemaValidator';

async function findAndFixOrphanedOrders() {
  const fkConfig = {
    sourceColumn: 'customer_id',
    targetCollection: 'customers',
    targetPrimaryKey: 'customer_id',
    onDelete: 'cascade',
    onUpdate: 'cascade',
    required: true,
    validateReferences: true
  };
  
  // Find orphaned orders (orders with non-existent customers)
  const orphaned = await ForeignKeyValidator.findOrphanedRecords(
    'orders',
    fkConfig,
    db
  );
  
  console.log(`Found ${orphaned.length} orphaned orders`);
  
  orphaned.forEach(order => {
    console.log(`Order ${order.id} references non-existent customer ${order.customer_id}`);
  });
  
  // Options to fix:
  // 1. Delete orphaned orders
  // 2. Create missing customers
  // 3. Reassign to default customer
  // 4. Set customer_id to null (if allowed)
}
```

---

## Summary

### Key Takeaways

1. **Primary Keys**: Always define a unique identifier
   - Use auto-generated for simplicity
   - Use CSV column for meaningful IDs
   - Use composite for multi-field uniqueness

2. **Foreign Keys**: Maintain relationships
   - Import parent tables first
   - Validate references before import
   - Handle orphaned records

3. **Normalization**: Reduce redundancy
   - Aim for 3NF for most use cases
   - Split data into logical tables
   - Use foreign keys to maintain relationships

4. **Validation**: Catch errors early
   - Validate data types
   - Check constraints
   - Verify referential integrity

5. **Error Handling**: Provide helpful feedback
   - Show clear error messages
   - Suggest fixes when possible
   - Allow auto-fix for simple errors
