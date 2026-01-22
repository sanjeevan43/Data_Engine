# 📚 Database Concepts Documentation

Complete guide to understanding and implementing database concepts in the Firebase CSV Importer.

---

## 📖 What You'll Learn

This documentation covers the **6 essential database concepts** (narration) for storing data properly:

1. **Primary Keys (PK)** - Unique identifiers for records
2. **Foreign Keys (FK)** - Relationships between tables
3. **Data Normalization** - Organizing data efficiently (6 Normal Forms)
4. **Data Types & Validation** - Ensuring data quality
5. **Indexing** - Optimizing query performance
6. **Data Integrity** - Maintaining consistency

---

## 🎯 Quick Start

### For Beginners
Start with the **Quick Reference** for a fast overview:
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Tables, checklists, and snippets

### For Detailed Learning
Read the **Complete Guide** for in-depth explanations:
- [DATABASE_CONCEPTS.md](./DATABASE_CONCEPTS.md) - Comprehensive theory and concepts

### For Practical Application
See **Real Examples** with working code:
- [EXAMPLES.md](./EXAMPLES.md) - 6 complete examples with code

---

## 🔑 Primary Keys (PK)

### What is it?
A **unique identifier** for each record in your database.

### Why it matters?
- Prevents duplicate records
- Enables fast lookups
- Required for relationships

### Quick Example
```typescript
// Auto-generated (recommended)
primaryKey: { type: 'auto' }

// Use email as PK
primaryKey: { type: 'csv-column', columnName: 'email' }

// Composite key
primaryKey: { 
  type: 'composite', 
  compositeColumns: ['student_id', 'course_id'] 
}
```

**📚 Learn more:** [DATABASE_CONCEPTS.md#primary-keys](./DATABASE_CONCEPTS.md#primary-keys-pk)

---

## 🔗 Foreign Keys (FK)

### What is it?
A **reference** to another table's primary key, creating relationships.

### Why it matters?
- Maintains data consistency
- Prevents orphaned records
- Enables complex queries

### Quick Example
```typescript
// Orders reference Customers
foreignKeyConfig: {
  sourceColumn: 'customer_id',      // Column in orders
  targetCollection: 'customers',     // Referenced table
  targetPrimaryKey: 'id',           // PK in customers
  onDelete: 'restrict',             // Can't delete customer with orders
  onUpdate: 'cascade'               // Update all orders if customer ID changes
}
```

**📚 Learn more:** [DATABASE_CONCEPTS.md#foreign-keys](./DATABASE_CONCEPTS.md#foreign-keys-fk)

---

## 📊 6 Normal Forms (Normalization)

### What is it?
A systematic approach to organizing data to **reduce redundancy** and **improve integrity**.

### The 6 Levels

| Level | Rule | Example |
|-------|------|---------|
| **1NF** | Each cell has ONE value | ✅ One phone per row |
| **2NF** | 1NF + No partial dependencies | ✅ Split student info from enrollment |
| **3NF** | 2NF + No transitive dependencies | ✅ Split department info from employee |
| **BCNF** | 3NF + Every determinant is candidate key | Advanced |
| **4NF** | BCNF + No multi-valued dependencies | Very advanced |
| **5NF** | 4NF + No join dependencies | Theoretical |

### Recommendation
**Aim for 3NF** - It's the sweet spot for most applications!

**📚 Learn more:** [DATABASE_CONCEPTS.md#data-normalization](./DATABASE_CONCEPTS.md#data-normalization)

---

## 🎯 Data Types & Validation

### Supported Types
```typescript
'string' | 'number' | 'integer' | 'float' | 'boolean' 
| 'date' | 'datetime' | 'timestamp' | 'email' | 'url' 
| 'phone' | 'json' | 'array' | 'geopoint'
```

### Validation Rules
```typescript
validation: {
  min: 0,                          // Minimum value/length
  max: 100,                        // Maximum value/length
  pattern: '^[A-Z]{2}\\d{4}$',    // Regex pattern
  enum: ['active', 'inactive'],    // Allowed values
  customValidator: (val) => val > 0 // Custom function
}
```

**📚 Learn more:** [DATABASE_CONCEPTS.md#data-types--validation](./DATABASE_CONCEPTS.md#data-types--validation)

---

## 🚀 Getting Started

### Step 1: Define Your Schema
```typescript
import { CollectionSchema } from './types/schema';

const userSchema: CollectionSchema = {
  collectionName: 'users',
  primaryKey: { type: 'auto' },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true
    },
    {
      name: 'age',
      type: 'integer',
      required: true,
      validation: { min: 0, max: 150 }
    }
  ]
};
```

### Step 2: Validate Your Data
```typescript
import { SchemaValidator } from './services/validators/SchemaValidator';

const result = await SchemaValidator.validate(csvData, userSchema, db);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // Show errors to user
}
```

### Step 3: Import
```typescript
if (result.valid) {
  await importData(csvData, userSchema);
  console.log('✅ Import successful!');
}
```

**📚 See complete examples:** [EXAMPLES.md](./EXAMPLES.md)

---

## 🛡️ Data Integrity Checklist

Before importing CSV data, ensure:

- [ ] **Primary Key** defined and unique
- [ ] **Foreign Keys** validated (references exist)
- [ ] **Data normalized** to at least 3NF
- [ ] **Data types** correct for each field
- [ ] **Required fields** have no NULL values
- [ ] **Unique constraints** checked
- [ ] **Validation rules** applied
- [ ] **Import order** correct (parents before children)

**📚 Full checklist:** [QUICK_REFERENCE.md#data-integrity-checklist](./QUICK_REFERENCE.md#data-integrity-checklist)

---

## 📁 File Structure

```
docs/
├── README.md              ← You are here
├── DATABASE_CONCEPTS.md   ← Detailed theory and explanations
├── EXAMPLES.md            ← 6 practical examples with code
└── QUICK_REFERENCE.md     ← Quick lookup tables and snippets

src/
├── types/
│   └── schema.ts          ← TypeScript type definitions
└── services/
    └── validators/
        └── SchemaValidator.ts ← Implementation
```

---

## 🎓 Learning Path

### Beginner
1. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Understand Primary Keys
3. Try [Example 1](./EXAMPLES.md#example-1-simple-user-import-auto-generated-pk)

### Intermediate
1. Read [DATABASE_CONCEPTS.md](./DATABASE_CONCEPTS.md)
2. Learn Foreign Keys
3. Master 1NF, 2NF, 3NF
4. Try [Example 2](./EXAMPLES.md#example-2-e-commerce-system-pk--fk)

### Advanced
1. Study BCNF, 4NF, 5NF
2. Implement custom validators
3. Build complex schemas with multiple FKs
4. Try [Example 3](./EXAMPLES.md#example-3-composite-primary-key)

---

## 💡 Common Use Cases

### Use Case 1: Simple Data Import
**Goal:** Import user list with auto-generated IDs

**Solution:**
- Use `primaryKey: { type: 'auto' }`
- Validate email uniqueness
- See [Example 1](./EXAMPLES.md#example-1-simple-user-import-auto-generated-pk)

---

### Use Case 2: E-commerce System
**Goal:** Import customers, products, and orders with relationships

**Solution:**
- Use CSV columns as PKs
- Define foreign keys for orders
- Import in correct order (customers → products → orders)
- See [Example 2](./EXAMPLES.md#example-2-e-commerce-system-pk--fk)

---

### Use Case 3: Student Enrollments
**Goal:** Track which students are in which courses

**Solution:**
- Use composite key (student_id + course_id + semester)
- Define FKs to students and courses
- See [Example 3](./EXAMPLES.md#example-3-composite-primary-key)

---

### Use Case 4: Normalize Messy Data
**Goal:** Clean up denormalized CSV with duplicate data

**Solution:**
- Analyze with `NormalizationAnalyzer`
- Split into multiple normalized tables
- Define relationships with FKs
- See [Example 4](./EXAMPLES.md#example-4-normalization-in-action)

---

## 🔧 Code Reference

### Validators
```typescript
// Validate entire schema
SchemaValidator.validate(data, schema, db)

// Validate primary keys only
PrimaryKeyValidator.validateUniqueness(data, pkConfig)

// Validate foreign keys only
ForeignKeyValidator.validateReferences(data, fkConfigs, db)

// Validate data types only
DataTypeValidator.validateTypes(data, fields)

// Analyze normalization
NormalizationAnalyzer.analyzeNormalization(data, schema)
```

### Types
```typescript
import type {
  CollectionSchema,
  PrimaryKeyConfig,
  ForeignKeyConfig,
  FieldSchema,
  ValidationResult
} from './types/schema';
```

**📚 Full API reference:** [schema.ts](../src/types/schema.ts)

---

## ❓ FAQ

**Q: What's the difference between PK and FK?**
- **PK** = Unique ID for THIS table
- **FK** = Reference to ANOTHER table's PK

**Q: Which normal form should I use?**
- **3NF** is recommended for most use cases

**Q: Can I skip validation?**
- Not recommended! Validation prevents data corruption

**Q: What if I have circular FK dependencies?**
- Redesign your schema to avoid circles

**Q: How do I handle existing data in Firebase?**
- Use `updateExisting: true` in import config

**📚 More FAQs:** [QUICK_REFERENCE.md#faq](./QUICK_REFERENCE.md#faq)

---

## 🎯 Next Steps

1. **Read the basics:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Understand theory:** [DATABASE_CONCEPTS.md](./DATABASE_CONCEPTS.md)
3. **Try examples:** [EXAMPLES.md](./EXAMPLES.md)
4. **Build your schema:** Use [schema.ts](../src/types/schema.ts)
5. **Validate your data:** Use [SchemaValidator.ts](../src/services/validators/SchemaValidator.ts)

---

## 📞 Need Help?

- **Concepts unclear?** Read [DATABASE_CONCEPTS.md](./DATABASE_CONCEPTS.md)
- **Need examples?** Check [EXAMPLES.md](./EXAMPLES.md)
- **Quick lookup?** Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Type definitions?** See [schema.ts](../src/types/schema.ts)

---

## 📝 Summary

This documentation teaches you how to:

✅ Define **Primary Keys** for unique identification  
✅ Create **Foreign Keys** for relationships  
✅ Apply **6 Normal Forms** to organize data  
✅ Validate **Data Types** and constraints  
✅ Ensure **Data Integrity** before import  
✅ Handle **Errors** gracefully with suggested fixes  

**Happy importing! 🚀**
