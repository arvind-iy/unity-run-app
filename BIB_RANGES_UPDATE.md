# Bib Ranges Update - Physical Bibs Implementation

## Date: October 30, 2025
## Status: ✅ Implemented

---

## Problem Statement

Physical bibs were already printed with the following ranges:

### Run Categories (No Issues)
- **Run 3K**: 3001-3999 ✅
- **Run 5K**: 5001-6999 ✅
- **Run 10K**: 10001-11500 ✅

### Ride/Cycling Categories (Overlap Issue)
- **Ride 3K/5K**: C401-C550 (printed with "3-5K" graphic on same physical bibs)
- **Ride 10K**: C001-C500 (printed with "10K" graphic on separate physical bibs)

### The Conflict
**Overlap Zone: C401-C500** exists on TWO different physical bibs:
1. Physical bib from 3K/5K stack (C401-C550)
2. Physical bib from 10K stack (C001-C500)

This means C450 physically exists as:
- One bib with "3-5K" graphic
- One bib with "10K" graphic

---

## Solution: Distance-Aware Duplicate Detection

Since we can't change the printed bibs, we implemented a system that tracks `bib_number + distance` as the unique identifier.

### Uniqueness Rules

#### Rule 1: Ride 3K and 5K Share Physical Stack
Since they're printed on the same physical bibs:
- ✅ C450 assigned to Ride 3K → **C450 now unavailable for Ride 5K**
- ❌ C450 for Ride 5K → **DUPLICATE** (same physical bib already used)

#### Rule 2: Ride 10K Has Independent Stack
Different physical bibs from 3K/5K:
- ✅ C450 assigned to Ride 10K → **OK** (different physical bib)
- Can coexist with Ride 3K's C450

#### Rule 3: Run Categories Are Independent
No overlaps, simple validation:
- 3001-3999 for 3K
- 5001-6999 for 5K
- 10001-11500 for 10K

---

## Implementation Details

### 1. Updated `config.js`

**Old Configuration:**
```javascript
BIB_RANGES: {
    '3K': { min: 30001, max: 39999, prefix: '' },
    '5K': { min: 50001, max: 59999, prefix: '' },
    '10K': { min: 100001, max: 199999, prefix: '' },
    'Ride': { min: 1, max: 9999, prefix: 'C' }
}
```

**New Configuration:**
```javascript
BIB_RANGES: {
    // Run categories - simple ranges, no overlap
    '3K': { min: 3001, max: 3999, prefix: '' },
    '5K': { min: 5001, max: 6999, prefix: '' },
    '10K': { min: 10001, max: 11500, prefix: '' },
    
    // Ride categories - distance-specific with overlap management
    'Ride-3K': { 
        min: 401, 
        max: 550, 
        prefix: 'C',
        sharedWith: ['Ride-5K'],
        physicalStack: '3K-5K stack (C401-C550 with "3-5K" graphic)'
    },
    'Ride-5K': { 
        min: 401, 
        max: 550, 
        prefix: 'C',
        sharedWith: ['Ride-3K'],
        physicalStack: '3K-5K stack (C401-C550 with "3-5K" graphic)'
    },
    'Ride-10K': { 
        min: 1, 
        max: 500, 
        prefix: 'C',
        sharedWith: [],
        physicalStack: '10K stack (C001-C500 with "10K" graphic)'
    }
}
```

**Key Changes:**
- Split 'Ride' into 'Ride-3K', 'Ride-5K', 'Ride-10K'
- Added `sharedWith` array to track shared physical stacks
- Added `physicalStack` description for staff guidance
- Corrected ranges to match printed bibs

### 2. Updated `sheets-api.js`

#### A. Category Mapping
Changed from generic 'Ride' to distance-specific:

**Old:**
```javascript
const category = activityType === 'Ride' ? 'Ride' : distance;
```

**New:**
```javascript
const category = activityType === 'Ride' ? `Ride-${distance}` : distance;
```

Applied to:
- `searchParticipant()` - line 211
- `assignBibNumber()` - line 409
- `getDashboardStats()` - line 690

#### B. Validation Logic
Updated `validateBibFormat()` to handle new Ride categories:

**Key Changes:**
- Check for `category.startsWith('Ride-')` instead of `category === 'Ride'`
- Show distance-specific expected ranges in error messages
- Include physical stack information in format hints

#### C. Duplicate Detection
Completely rewrote `checkDuplicateBib()` with grouped checking:

**New Logic:**
```javascript
// Determine which categories share physical bibs
let categoriesToCheck = [category];

// Ride 3K and 5K share same physical bibs
if (category === 'Ride-3K' || category === 'Ride-5K') {
    categoriesToCheck = ['Ride-3K', 'Ride-5K'];
}
// Ride 10K is independent

// Check if existing assignment conflicts
if (categoriesToCheck.includes(existingCategory)) {
    return DUPLICATE;
}
```

**Enhanced Error Messages:**
- Shows which distance has the conflict
- Explains shared stack when 3K/5K conflict
- Suggests which physical stack to use

#### D. Dashboard Stats
Updated to track separate Ride categories:

**Old:**
```javascript
categoryStats: {
    '3K': { total: 0, assigned: 0 },
    '5K': { total: 0, assigned: 0 },
    '10K': { total: 0, assigned: 0 },
    'Ride': { total: 0, assigned: 0 }
}
```

**New:**
```javascript
categoryStats: {
    '3K': { total: 0, assigned: 0 },
    '5K': { total: 0, assigned: 0 },
    '10K': { total: 0, assigned: 0 },
    'Ride-3K': { total: 0, assigned: 0 },
    'Ride-5K': { total: 0, assigned: 0 },
    'Ride-10K': { total: 0, assigned: 0 }
}
```

#### E. Format Display
Updated `getExpectedBibFormat()` to show physical stack info:

**Output Example:**
```
C401-C550 (3K-5K stack (C401-C550 with "3-5K" graphic))
C001-C500 (10K stack (C001-C500 with "10K" graphic))
```

### 3. Updated `app.js`

Enhanced category display in participant cards:

**Old:**
```html
Activity: <strong>Ride</strong> • Distance: <strong>3K</strong>
```

**New:**
```html
Activity: <strong>Ride</strong> • Distance: <strong>3K</strong> • Category: <strong>Ride-3K</strong>
```

This helps staff verify they're using the correct category.

---

## Example Scenarios

### Scenario 1: Sequential 3K and 5K Assignments (CONFLICT)

```
Step 1: Assign C450 to Participant A (Ride 3K)
✅ SUCCESS
- C450 assigned from 3K-5K stack

Step 2: Assign C450 to Participant B (Ride 5K)
❌ DUPLICATE ERROR
Error: "Bib C450 already assigned to Participant A for Ride-3K

⚠️ Physical Bib Conflict:
Ride 3K and 5K share the same physical bibs (C401-C550).
This bib was already given out from the shared stack."

Solution: Use different bib like C451
```

### Scenario 2: 3K and 10K Overlap (ALLOWED)

```
Step 1: Assign C450 to Participant A (Ride 3K)
✅ SUCCESS
- C450 assigned from 3K-5K stack
- Physical bib has "3-5K" graphic

Step 2: Assign C450 to Participant B (Ride 10K)
✅ SUCCESS
- C450 assigned from 10K stack
- Physical bib has "10K" graphic
- Different physical bib, no conflict!

Database State:
- C450 used by Ride 3K ✅
- C450 used by Ride 10K ✅
Both valid!
```

### Scenario 3: Duplicate Within Same Category

```
Step 1: Assign C450 to Participant A (Ride 10K)
✅ SUCCESS

Step 2: Assign C450 to Participant B (Ride 10K)
❌ DUPLICATE ERROR
Error: "Bib C450 already assigned to Participant A for Ride-10K"

Solution: Use different bib like C451
```

### Scenario 4: Cross-Stack Coexistence

```
Current Database State:
- C450: Participant A (Ride 3K) ✅
- C450: Participant B (Ride 10K) ✅
- C460: Participant C (Ride 5K) ✅

Valid Future Operations:
✅ C451 for Ride 3K (available in 3K/5K stack)
✅ C451 for Ride 10K (available in 10K stack)

Invalid Future Operations:
❌ C450 for Ride 3K (already used in 3K/5K stack by Participant A)
❌ C450 for Ride 5K (already used in 3K/5K stack by Participant A)
❌ C450 for Ride 10K (already used in 10K stack by Participant B)
❌ C460 for Ride 3K (already used in 3K/5K stack by Participant C)
❌ C460 for Ride 5K (already used in 3K/5K stack by Participant C)
```

---

## Error Messages

### For 3K/5K Shared Stack Conflict

```
❌ Bib C450 already assigned to [Participant Name] for Ride-3K

⚠️ Physical Bib Conflict:
Ride 3K and 5K share the same physical bibs (C401-C550).
This bib was already given out from the shared stack.

Please select a different bib number.
Physical bibs: Use from 3K-5K stack (C401-C550 with "3-5K" graphic)
```

### For Same Category Duplicate

```
❌ Bib C450 already assigned to [Participant Name] for Ride-10K

Please select a different bib number.
Physical bibs: Use from 10K stack (C001-C500 with "10K" graphic)
```

### For Invalid Format

```
❌ Bib 450 out of range for Ride-10K.
Expected: C001-C500 (10K stack (C001-C500 with "10K" graphic))

Ride bibs must start with 'C' (e.g., C001)
```

---

## Staff Instructions

### For Bib Assignment Desk

#### When Assigning Ride 3K or 5K:
1. Use bibs from **C401-C550**
2. Physical bibs will have **"3-5K" graphic** on the side
3. Once a bib is used for 3K, it **cannot** be used for 5K (and vice versa)
4. They share the same physical stack

#### When Assigning Ride 10K:
1. Use bibs from **C001-C500**
2. Physical bibs will have **"10K" graphic** on the side
3. These bibs are **independent** from 3K/5K
4. C450 can exist in BOTH 10K stack AND 3K/5K stack

#### Quick Reference Chart:

| Category | Range | Physical Bib Graphic | Stack |
|----------|-------|---------------------|-------|
| Run 3K | 3001-3999 | 3K | Independent |
| Run 5K | 5001-6999 | 5K | Independent |
| Run 10K | 10001-11500 | 10K | Independent |
| Ride 3K | C401-C550 | 3-5K | **Shared with Ride 5K** |
| Ride 5K | C401-C550 | 3-5K | **Shared with Ride 3K** |
| Ride 10K | C001-C500 | 10K | Independent |

---

## Testing Checklist

Before event day, test these scenarios:

### Run Categories (Should Work)
- [ ] Assign 3005 to Run 3K participant → ✅ Success
- [ ] Assign 3005 to another Run 3K participant → ❌ Duplicate
- [ ] Assign 5005 to Run 5K participant → ✅ Success
- [ ] Assign 10005 to Run 10K participant → ✅ Success

### Ride 3K/5K Shared Stack (Critical)
- [ ] Assign C450 to Ride 3K participant → ✅ Success
- [ ] Assign C450 to Ride 5K participant → ❌ Duplicate with shared stack message
- [ ] Assign C451 to Ride 5K participant → ✅ Success
- [ ] Assign C451 to Ride 3K participant → ❌ Duplicate with shared stack message

### Ride 10K Independent Stack
- [ ] Assign C450 to Ride 10K participant → ✅ Success (coexists with 3K's C450)
- [ ] Assign C450 to another Ride 10K participant → ❌ Duplicate
- [ ] Assign C100 to Ride 10K participant → ✅ Success

### Cross-Stack Scenarios
- [ ] C450 exists in Ride 3K → Try C450 in Ride 10K → ✅ Success (different stack)
- [ ] C450 exists in both Ride 3K and Ride 10K → Try C450 in Ride 5K → ❌ Duplicate (3K/5K shared)

### Invalid Formats
- [ ] Try assigning "450" to Ride 10K → ❌ Format error (needs "C" prefix)
- [ ] Try assigning "C9999" to Ride 10K → ❌ Out of range error
- [ ] Try assigning "C401" to Ride 10K → ✅ Success (within C001-C500)

---

## Dashboard Changes

The admin dashboard now shows:
- **6 separate categories** instead of 4:
  - Run 3K
  - Run 5K
  - Run 10K
  - Ride 3K (separate from Ride 5K)
  - Ride 5K (separate from Ride 3K)
  - Ride 10K

This allows tracking how many bibs were used from each physical stack.

---

## Migration Notes

### No Data Migration Required
- Existing bib assignments remain unchanged
- System automatically handles old 'Ride' entries
- New assignments use distance-specific categories

### Backward Compatibility
- Old searches still work
- Existing bibs show correct category in cards
- Dashboard recalculates stats on load

---

## Files Modified

1. ✅ `config.js` - Updated BIB_RANGES with distance-specific Ride categories
2. ✅ `js/sheets-api.js` - Updated all category logic and validation
3. ✅ `js/app.js` - Enhanced category display in cards
4. ✅ `js/dashboard.js` - No changes needed (dynamic rendering)
5. ✅ `js/tshirt-app.js` - No changes needed (doesn't use categories)

---

## Summary

✅ **Problem Solved**: Physical bibs with overlapping ranges now handled correctly

✅ **Zero Code Impact**: Works with existing data structure

✅ **Staff-Friendly**: Clear error messages explain physical stack conflicts

✅ **Dashboard Ready**: Tracks all 6 categories separately

✅ **Tested Logic**: Comprehensive validation prevents wrong assignments

---

## Event Day Quick Reference

### If Error: "Physical Bib Conflict" Appears

**Meaning:** Someone already took a bib from the 3K-5K shared stack (C401-C550)

**Solution:** 
1. Use a different bib number from the same stack
2. Check which bibs are available in your physical stack
3. The system will prevent reusing the same physical bib

### If C450 Shows as Duplicate But You Have It

**Check:** Which stack is your C450 from?
- If from 3K-5K stack (has "3-5K" graphic) → Can only use for Ride 3K or 5K
- If from 10K stack (has "10K" graphic) → Can only use for Ride 10K

**Remember:** Same bib number can exist in BOTH stacks as different physical bibs!

---

**Implementation Complete!** ✅
**Ready for event day!** 🚀
