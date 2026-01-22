# Database Concepts - Quick Reference

## 🔑 Primary Keys (PK)

| Concept | Definition | Example |
|---------|------------|---------|
| **What** | Unique identifier for each record | `user_id`, `email`, `product_sku` |
| **Purpose** | Ensures no duplicate records | Each user has unique ID |
| **Rules** | Must be unique, cannot be NULL | ✅ `U001` ❌ `null` |

### Types of Primary Keys

```typescript
// 1. Auto-generated (Firebase default)
primaryKey: { type: 'auto' }
// Result: abc123xyz (Firebase generates)

// 2. CSV column
primaryKey: { type: 'csv-column', columnName: 'email' }
// Result: john@example.com

// 3. Composite (multiple columns)
primaryKey: { 
  type: 'composite', 
  compositeColumns: ['student_id', 'course_id'],
  compositeSeparator: '_'
}
// Result: S001_CS101
```

---

## 🔗 Foreign Keys (FK)

| Concept | Definition | Example |
|---------|------------|---------|
| **What** | References another table's PK | `customer_id` in orders → `id` in customers |
| **Purpose** | Creates relationships | Order belongs to Customer |
| **Rules** | Must reference existing PK | ✅ Valid customer ❌ Non-existent customer |

### FK Actions

```typescript
onDelete: 'cascade'    // Delete orders when customer deleted
onDelete: 'set-null'   // Set customer_id to null
onDelete: 'restrict'   // Prevent deletion if orders exist
onDelete: 'no-action'  // Do nothing (may cause orphans)
```

---

## 📊 6 Normal Forms (Normalization)

### 1️⃣ First Normal Form (1NF)
**Rule:** Each cell has ONE value only

❌ **Bad:**
```csv
name,phones
John,"555-1234, 555-5678"
```

✅ **Good:**
```csv
name,phone
John,555-1234
John,555-5678
```

---

### 2️⃣ Second Normal Form (2NF)
**Rule:** 1NF + No partial dependencies

❌ **Bad:**
```csv
student_id,course_id,student_name,course_name
S001,C101,John,Math
```
Problem: `student_name` depends only on `student_id`, not full key

✅ **Good:**
```csv
# students.csv
student_id,student_name
S001,John

# courses.csv
course_id,course_name
C101,Math

# enrollments.csv
student_id,course_id
S001,C101
```

---

### 3️⃣ Third Normal Form (3NF)
**Rule:** 2NF + No transitive dependencies

❌ **Bad:**
```csv
employee_id,department_id,department_name
E001,D01,Sales
```
Problem: `department_name` depends on `department_id`, not `employee_id`

✅ **Good:**
```csv
# employees.csv
employee_id,department_id
E001,D01

# departments.csv
department_id,department_name
D01,Sales
```

---

### 4️⃣ Boyce-Codd Normal Form (BCNF)
**Rule:** 3NF + Every determinant is a candidate key
*Advanced - rarely needed for CSV imports*

---

### 5️⃣ Fourth Normal Form (4NF)
**Rule:** BCNF + No multi-valued dependencies
*Very advanced - rarely needed*

---

### 6️⃣ Fifth Normal Form (5NF)
**Rule:** 4NF + No join dependencies
*Theoretical - almost never needed*

---

## 🎯 Data Types

| Type | Description | Example | Validation |
|------|-------------|---------|------------|
| `string` | Text | `"John Doe"` | Length, pattern |
| `number` | Any number | `42`, `3.14` | Min, max |
| `integer` | Whole number | `42` | Min, max |
| `float` | Decimal | `3.14` | Min, max |
| `boolean` | True/false | `true`, `false` | - |
| `date` | Date only | `2024-01-15` | Valid date |
| `datetime` | Date + time | `2024-01-15T10:30:00` | Valid datetime |
| `email` | Email address | `john@example.com` | Email format |
| `url` | Web address | `https://example.com` | URL format |
| `phone` | Phone number | `555-1234` | Phone format |
| `json` | JSON object | `{"key": "value"}` | Valid JSON |
| `array` | List | `[1, 2, 3]` | - |

---

## ✅ Validation Rules

```typescript
validation: {
  min: 0,                    // Minimum value/length
  max: 100,                  // Maximum value/length
  pattern: '^[A-Z]{2}\\d{4}$', // Regex pattern
  enum: ['active', 'inactive'], // Allowed values
  customValidator: (val) => val > 0 // Custom function
}
```

---

## 🚀 Import Order

**Always import in dependency order:**

```
1. Tables with NO foreign keys (independent)
   ↓
2. Tables that reference step 1
   ↓
3. Tables that reference step 2
   ↓
...
```

**Example:**
```
1. customers.csv  (no dependencies)
2. products.csv   (no dependencies)
3. orders.csv     (references customers + products)
```

---

## 🛡️ Data Integrity Checklist

Before importing, ensure:

- [ ] **Entity Integrity**
  - [ ] Primary key defined
  - [ ] No NULL primary keys
  - [ ] No duplicate primary keys

- [ ] **Referential Integrity**
  - [ ] All foreign keys reference existing records
  - [ ] Import order is correct
  - [ ] No orphaned records

- [ ] **Domain Integrity**
  - [ ] Data types are correct
  - [ ] Values within valid ranges
  - [ ] Required fields are not empty

- [ ] **User-Defined Integrity**
  - [ ] Business rules validated
  - [ ] Custom constraints checked

---

## 🔍 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| Duplicate PK | Same ID used twice | Use auto-generated or ensure uniqueness |
| FK violation | Referenced record doesn't exist | Import parent table first |
| Type mismatch | Wrong data type | Convert to correct type |
| NULL in required | Missing value | Provide default or fix data |
| Pattern mismatch | Invalid format | Fix format (e.g., email) |

---

## 💡 Best Practices

### 1. Choose Right PK Strategy
- **Auto-generated**: Simple, guaranteed unique
- **CSV column**: When you have natural key (email, SKU)
- **Composite**: When uniqueness requires multiple fields

### 2. Design Foreign Keys Carefully
- Always validate references before import
- Choose appropriate `onDelete` action
- Document relationships

### 3. Normalize to 3NF
- Reduces redundancy
- Easier to maintain
- Better data integrity
- Don't over-normalize (BCNF+ rarely needed)

### 4. Validate Early
- Check data before import
- Show clear error messages
- Provide suggested fixes
- Allow user to review and fix

### 5. Handle Errors Gracefully
- Don't fail silently
- Log all errors
- Provide rollback option
- Show progress

---

## 📖 Quick Code Snippets

### Validate Before Import
```typescript
const result = await SchemaValidator.validate(csvData, schema, db);
if (!result.valid) {
  console.error('Errors:', result.errors);
  return;
}
```

### Check Primary Key Uniqueness
```typescript
const pkErrors = PrimaryKeyValidator.validateUniqueness(
  csvData, 
  schema.primaryKey
);
```

### Validate Foreign Keys
```typescript
const fkErrors = await ForeignKeyValidator.validateReferences(
  csvData,
  schema.foreignKeys,
  db
);
```

### Find Orphaned Records
```typescript
const orphaned = await ForeignKeyValidator.findOrphanedRecords(
  'orders',
  fkConfig,
  db
);
```

---

## 🎓 Learning Path

1. **Start Here**: Understand Primary Keys
2. **Next**: Learn Foreign Keys and relationships
3. **Then**: Master 1NF, 2NF, 3NF normalization
4. **Advanced**: Explore BCNF and beyond (optional)
5. **Practice**: Apply to real CSV imports

---

## 📚 Additional Resources

- [DATABASE_CONCEPTS.md](./DATABASE_CONCEPTS.md) - Detailed explanations
- [EXAMPLES.md](./EXAMPLES.md) - Real-world examples
- [schema.ts](../src/types/schema.ts) - Type definitions
- [SchemaValidator.ts](../src/services/validators/SchemaValidator.ts) - Implementation

---

## ❓ FAQ

**Q: When should I use auto-generated vs CSV column for PK?**
A: Use auto-generated for simplicity. Use CSV column when you have a natural, meaningful unique identifier (like email or product SKU).

**Q: What normalization level should I aim for?**
A: 3NF is the sweet spot for most applications. It eliminates most redundancy while remaining practical.

**Q: How do I handle circular foreign key dependencies?**
A: Avoid circular dependencies by redesigning your schema. If unavoidable, import one table first without FK validation, then update.

**Q: Can I change primary key after import?**
A: Very difficult in NoSQL databases like Firebase. Design carefully upfront.

**Q: What if my CSV has no natural primary key?**
A: Use auto-generated keys. Firebase will create unique IDs automatically.
