---
description: Neno Helper Guide - Dynamic Columns, Logic & Error Handling
---

# Neno Helper Guide

This guide "trains" the Neno Helper (AI Agent) on how to support:
1.  **Dynamic Column Addition**: Adding new columns via Excel upload.
2.  **Custom Logic**: Handling user-defined calculations.
3.  **Error Handling**: Robust error management.

## 1. Dynamic Column Addition

The application now supports a `customFields` JSONB column in the `LineItem` model.
When a user wants to add a new column (e.g., "Region", "Department Code"):

### Process:
1.  **Import**:
    - The `BudgetImportService` already supports `customMapping`.
    - Modify `budgetImportService.js` to store any unmapped but selected columns into `LineItem.customFields`.
    - Example:
      ```javascript
      // In budgetImportService.js
      if (!isStandardField(header)) {
          lineItem.customFields[header] = row[header];
      }
      ```

2.  **Frontend Display**:
    - `BudgetList.jsx` and `ActualsList.jsx` need to be updated to dynamically generate columns based on unique keys found in `customFields`.
    - Fetch all unique keys from `customFields` across the dataset.
    - Add these keys to the `columns` array in DataGrid.
    - Use `valueGetter: (params) => params.row.customFields?.['ColumnName']`.

## 2. Custom Logic & Auto-Calculation

If users want to define logic (e.g., `Total Cost = Annual Budget + Tax`):

### Approach:
1.  **Define Formula**: Store formulas in a `ColumnDefinition` table (to be created if needed, or in a config file).
2.  **Backend Calculation**:
    - When `LineItem` is updated/created, run the calculation logic.
    - If logic is complex, use a "Scripting" approach or predefined formula parser.
3.  **Frontend Calculation**:
    - For simple arithmetic, use `valueGetter` in DataGrid.
    - Example: `valueGetter: (params) => params.row.annual_budget * 1.18`.

## 3. Error Handling & Support

**Neno Helper's Role**:
- **Monitor**: Watch for 500 errors in logs.
- **Explain**: Decode Prisma/SQL errors into user-friendly messages.
- **Fix**: Proactively offer to fix data (e.g., "Invalid Date Format found in Row 50").

### Standard Error Response Format:
```json
{
  "error": "GenericError",
  "message": "User friendly message",
  "details": "Technical details for debugging",
  "suggestion": "How to fix it"
}
```

## 4. Workflows to Run

- `/import-budget-guide`: Guide user through import errors.
- `/test-budget-import`: Validate new columns.

---
**Note to Agent**: When the user asks for "new column X", check if it maps to an existing field. If not, map it to `customFields`. update the frontend to display it.
