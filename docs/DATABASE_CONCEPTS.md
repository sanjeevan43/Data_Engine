# Database Concepts Guide for CSV Importer

## 📚 Table of Contents
1. [Primary Keys (PK)](#primary-keys-pk)
2. [Foreign Keys (FK)](#foreign-keys-fk)
3. [Data Normalization](#data-normalization)
4. [Data Types & Validation](#data-types--validation)
5. [Indexing Strategy](#indexing-strategy)
6. [Data Integrity](#data-integrity)

---

## 🔑 Primary Keys (PK)

### What is a Primary Key?
A **Primary Key** is a unique identifier for each record in a database table/collection. It ensures that:
- Every record can be uniquely identified
- No duplicate records exist
- No NULL values are allowed

### Why Primary Keys Matter in CSV Import

When importing CSV data to Firebase/databases, you need to decide:

**Option 1: Auto-Generated IDs (Recommended for Firebase)**
```javascript
// Firebase auto-generates unique IDs
const docRef = await addDoc(collection(db, "users"), {
  name: "John Doe",
  email: "john@example.com"
});
// docRef.id = "abc123xyz" (auto-generated)
```

**Option 2: Use CSV Column as Primary Key**
```javascript
// Use email as primary key
await setDoc(doc(db, "users", row.email), {
  name: row.name,
  email: row.email
});
```

### Choosing the Right Primary Key

| CSV Column | Good PK? | Reason |
|------------|----------|--------|
| Email | ✅ Yes | Unique, stable, meaningful |
| Phone Number | ⚠️ Maybe | Can change, formatting issues |
| Name | ❌ No | Not unique (duplicates) |
| Auto-increment ID | ✅ Yes | Guaranteed unique |
| UUID/GUID | ✅ Yes | Globally unique |

### Implementation in Your Project

```typescript
// src/types/database.ts
export interface PrimaryKeyConfig {
  type: 'auto' | 'csv-column' | 'composite';
  columnName?: string; // For 'csv-column' type
  compositeColumns?: string[]; // For 'composite' type
}

// Example: User selects email as PK
const pkConfig: PrimaryKeyConfig = {
  type: 'csv-column',
  columnName: 'email'
};

// Example: Auto-generated PK
const pkConfig: PrimaryKeyConfig = {
  type: 'auto'
};
```

---

## 🔗 Foreign Keys (FK)

### What is a Foreign Key?
A **Foreign Key** is a field that references the Primary Key of another table/collection. It creates relationships between data.

### Example: E-commerce System

**Without Foreign Keys (Bad):**
```csv
# orders.csv
OrderID, CustomerName, CustomerEmail, ProductName, ProductPrice
1, John Doe, john@email.com, Laptop, 999
2, John Doe, john@email.com, Mouse, 25
3, Jane Smith, jane@email.com, Keyboard, 75
```
❌ Problems:
- Duplicate customer data
- If John changes email, must update multiple rows
- Inconsistent data (typos in name)

**With Foreign Keys (Good):**
```csv
# customers.csv
CustomerID, Name, Email
C001, John Doe, john@email.com
C002, Jane Smith, jane@email.com

# products.csv
ProductID, Name, Price
P001, Laptop, 999
P002, Mouse, 25
P003, Keyboard, 75

# orders.csv
OrderID, CustomerID, ProductID, Quantity
1, C001, P001, 1
2, C001, P002, 1
3, C002, P003, 1
```
✅ Benefits:
- No duplicate data
- Easy to update customer info
- Data consistency guaranteed

### Firebase Implementation

Firebase is **NoSQL** (document-based), so foreign keys work differently:

**Option 1: Reference by ID**
```javascript
// Collection: orders
{
  orderId: "order123",
  customerId: "C001", // Foreign key reference
  productId: "P001",  // Foreign key reference
  quantity: 1
}

// To get full order details:
const order = await getDoc(doc(db, "orders", "order123"));
const customer = await getDoc(doc(db, "customers", order.data().customerId));
const product = await getDoc(doc(db, "products", order.data().productId));
```

**Option 2: Embed Data (Denormalization)**
```javascript
// Collection: orders
{
  orderId: "order123",
  customer: {
    id: "C001",
    name: "John Doe",
    email: "john@email.com"
  },
  product: {
    id: "P001",
    name: "Laptop",
    price: 999
  },
  quantity: 1
}
```

### When to Use Foreign Keys

| Scenario | Use FK? | Strategy |
|----------|---------|----------|
| Customer → Orders | ✅ Yes | Store customerId in orders |
| Product → Orders | ✅ Yes | Store productId in orders |
| User → Profile | ⚠️ Maybe | Consider embedding profile in user doc |
| Blog Post → Comments | ✅ Yes | Store postId in comments |

### Implementation in Your Project

```typescript
// src/types/database.ts
export interface ForeignKeyConfig {
  sourceColumn: string; // Column in current CSV
  targetCollection: string; // Referenced collection
  targetPrimaryKey: string; // Referenced PK field
  onDelete: 'cascade' | 'set-null' | 'restrict';
  onUpdate: 'cascade' | 'set-null' | 'restrict';
}

// Example: Orders CSV references Customers
const fkConfig: ForeignKeyConfig = {
  sourceColumn: 'customer_id',
  targetCollection: 'customers',
  targetPrimaryKey: 'id',
  onDelete: 'restrict', // Don't allow deleting customer with orders
  onUpdate: 'cascade'   // Update all orders if customer ID changes
};
```

---

## 📊 Data Normalization

### The 6 Narration Levels (Normal Forms)

#### 1️⃣ First Normal Form (1NF)
**Rule:** Each cell contains only ONE value (atomic values)

❌ **Violates 1NF:**
```csv
Name, PhoneNumbers
John, 555-1234, 555-5678
```

✅ **Follows 1NF:**
```csv
Name, PhoneNumber
John, 555-1234
John, 555-5678
```

#### 2️⃣ Second Normal Form (2NF)
**Rule:** Must be in 1NF + No partial dependencies

❌ **Violates 2NF:**
```csv
StudentID, CourseID, StudentName, CourseName, Grade
1, C101, John, Math, A
1, C102, John, Science, B
```
Problem: StudentName depends only on StudentID, not the full key (StudentID + CourseID)

✅ **Follows 2NF:**
```csv
# students.csv
StudentID, StudentName
1, John

# courses.csv
CourseID, CourseName
C101, Math
C102, Science

# enrollments.csv
StudentID, CourseID, Grade
1, C101, A
1, C102, B
```

#### 3️⃣ Third Normal Form (3NF)
**Rule:** Must be in 2NF + No transitive dependencies

❌ **Violates 3NF:**
```csv
EmployeeID, DepartmentID, DepartmentName, DepartmentLocation
E001, D01, Sales, Building A
E002, D01, Sales, Building A
```
Problem: DepartmentName and DepartmentLocation depend on DepartmentID, not EmployeeID

✅ **Follows 3NF:**
```csv
# employees.csv
EmployeeID, DepartmentID
E001, D01
E002, D01

# departments.csv
DepartmentID, DepartmentName, DepartmentLocation
D01, Sales, Building A
```

#### 4️⃣ Boyce-Codd Normal Form (BCNF)
**Rule:** Must be in 3NF + Every determinant is a candidate key

Advanced form, rarely needed for CSV imports.

#### 5️⃣ Fourth Normal Form (4NF)
**Rule:** Must be in BCNF + No multi-valued dependencies

#### 6️⃣ Fifth Normal Form (5NF)
**Rule:** Must be in 4NF + No join dependencies

**For CSV Imports: Aim for 3NF** (most practical)

---

## 🎯 Data Types & Validation

### Common Data Types

```typescript
export type DataType = 
  | 'string'
  | 'number'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'email'
  | 'url'
  | 'phone'
  | 'json'
  | 'array'
  | 'geopoint';

export interface FieldSchema {
  name: string;
  type: DataType;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string; // Regex
    enum?: any[]; // Allowed values
  };
}
```

### Validation Examples

```typescript
// Email validation
const emailField: FieldSchema = {
  name: 'email',
  type: 'email',
  required: true,
  unique: true,
  validation: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  }
};

// Age validation
const ageField: FieldSchema = {
  name: 'age',
  type: 'integer',
  required: true,
  unique: false,
  validation: {
    min: 0,
    max: 150
  }
};

// Status validation
const statusField: FieldSchema = {
  name: 'status',
  type: 'string',
  required: true,
  unique: false,
  validation: {
    enum: ['active', 'inactive', 'pending', 'suspended']
  }
};
```

---

## 🚀 Indexing Strategy

### What is an Index?
An index is like a book's table of contents - it helps find data faster.

### When to Create Indexes

✅ **Create index on:**
- Primary keys (auto-indexed)
- Foreign keys (frequently joined)
- Columns used in WHERE clauses
- Columns used in ORDER BY
- Columns used in search

❌ **Don't index:**
- Small tables (< 1000 rows)
- Columns with low cardinality (e.g., boolean)
- Columns rarely queried

### Firebase Indexing

```javascript
// Firestore automatically indexes:
// - Document ID
// - Single fields

// For complex queries, create composite indexes:
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "orderDate", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🛡️ Data Integrity

### Integrity Rules

1. **Entity Integrity**
   - Every table must have a primary key
   - Primary key cannot be NULL

2. **Referential Integrity**
   - Foreign key must reference existing primary key
   - Cannot delete referenced record (or cascade delete)

3. **Domain Integrity**
   - Data must match defined type and constraints
   - Example: Age must be positive integer

4. **User-Defined Integrity**
   - Custom business rules
   - Example: Order total must equal sum of line items

### Implementation in CSV Import

```typescript
export class DataIntegrityValidator {
  // Check for duplicate primary keys
  validatePrimaryKeys(data: any[], pkField: string): ValidationResult {
    const seen = new Set();
    const duplicates = [];
    
    for (const row of data) {
      const pk = row[pkField];
      if (seen.has(pk)) {
        duplicates.push(pk);
      }
      seen.add(pk);
    }
    
    return {
      valid: duplicates.length === 0,
      errors: duplicates.map(pk => `Duplicate primary key: ${pk}`)
    };
  }
  
  // Check foreign key references
  async validateForeignKeys(
    data: any[],
    fkConfig: ForeignKeyConfig,
    db: Firestore
  ): Promise<ValidationResult> {
    const errors = [];
    
    for (const row of data) {
      const fkValue = row[fkConfig.sourceColumn];
      const docRef = doc(db, fkConfig.targetCollection, fkValue);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        errors.push(
          `Foreign key violation: ${fkValue} not found in ${fkConfig.targetCollection}`
        );
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

---

## 🎓 Best Practices for CSV Import

### 1. Pre-Import Validation
```typescript
async function validateBeforeImport(csvData: any[]) {
  // Check 1: Data types
  validateDataTypes(csvData);
  
  // Check 2: Required fields
  validateRequiredFields(csvData);
  
  // Check 3: Primary key uniqueness
  validatePrimaryKeys(csvData);
  
  // Check 4: Foreign key references
  await validateForeignKeys(csvData);
  
  // Check 5: Business rules
  validateBusinessRules(csvData);
}
```

### 2. Transaction Safety
```typescript
// Use batch writes for atomicity
const batch = writeBatch(db);

csvData.forEach((row) => {
  const docRef = doc(collection(db, "users"));
  batch.set(docRef, row);
});

await batch.commit(); // All or nothing
```

### 3. Error Handling
```typescript
interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}
```

### 4. Progress Tracking
```typescript
async function importWithProgress(
  csvData: any[],
  onProgress: (percent: number) => void
) {
  for (let i = 0; i < csvData.length; i++) {
    await importRow(csvData[i]);
    onProgress((i + 1) / csvData.length * 100);
  }
}
```

---

## 📝 Summary Checklist

Before importing CSV data, ensure:

- [ ] **Primary Key defined** (auto or CSV column)
- [ ] **Foreign Keys identified** and validated
- [ ] **Data normalized** to at least 3NF
- [ ] **Data types validated** for each column
- [ ] **Required fields** have no NULL values
- [ ] **Unique constraints** checked
- [ ] **Indexes planned** for frequently queried fields
- [ ] **Referential integrity** maintained
- [ ] **Error handling** implemented
- [ ] **Progress tracking** for large imports

---

## 🔧 Next Steps for Your Project

1. **Add PK/FK Selection UI**
   - Checkboxes for selecting primary key column
   - Multi-select for foreign key columns
   - Visual relationship diagram

2. **Implement Validation**
   - Pre-import data validation
   - Real-time error feedback
   - Suggested fixes from AI

3. **Schema Builder**
   - Auto-detect data types
   - Suggest normalization
   - Generate Firebase indexes

4. **Relationship Manager**
   - Visual FK relationship builder
   - Cascade delete options
   - Integrity constraint configuration

Would you like me to implement any of these features?
