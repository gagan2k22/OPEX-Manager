# Budget Import - Quick Reference

## ✨ What's New

Your Budget Import feature now has a **3-step wizard** with **custom field mapping**!

### New Fields Supported
✅ **Vendor Name** - Now imports and links to vendor master  
✅ **Renewal Date** - Track contract renewals  
✅ **Allocation Type** - Dedicated/Shared classification  
✅ **Initiative Type** - New/Existing projects  
✅ **Priority** - Priority levels  
✅ **FY26 Budget** - Fiscal year specific totals  

---

## 🚀 How to Use

### Step 1️⃣: Upload
- Click **"Upload Budget"** on Budget Tracker page
- Drag & drop or browse for Excel file
- Click **"Initialize Mapping"**

### Step 2️⃣: Map Fields
- Review auto-detected field mappings
- Adjust any incorrect mappings using dropdowns
- Skip unwanted columns
- Click **"Update Preview"**

### Step 3️⃣: Preview & Commit
- Review summary (Total, Accepted, Rejected)
- Download error report if needed
- Click **"Commit Import"** to finalize

---

## 📋 Excel Template Headers

### Required
- **UID** (must be unique)

### Recommended
- Description
- Tower
- Budget Head
- Vendor Name ⭐ NEW
- Start Date
- End Date
- Renewal Date ⭐ NEW
- Allocation Type ⭐ NEW
- Initiative Type ⭐ NEW
- Priority ⭐ NEW
- Total Budget (or FY26 Budget)
- Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar

---

## 💡 Tips

1. **Use standard headers** when possible for auto-detection
2. **Always include UID** - it's required
3. **Verify master data** exists (Towers, Budget Heads, Vendors)
4. **Check totals** - monthly amounts should sum to total
5. **Review Step 2** mapping before proceeding

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Column not detected | Use custom mapping in Step 2 |
| Vendor not found | Add vendor in Master Data first |
| Total mismatch | Ensure sum of months = total |
| Invalid date | Format cells as Date in Excel |

---

## 📊 Sample Excel Row

| UID | Description | Vendor Name | Renewal Date | Allocation Type | Initiative Type | Priority | FY26 Budget | Apr | May | ... |
|-----|-------------|-------------|--------------|-----------------|-----------------|----------|-------------|-----|-----|-----|
| DIT-OPEX FY25-001 | Cloud Services | AWS | 2025-03-31 | Shared | Existing | High | 1200000 | 100000 | 100000 | ... |

---

## 🔍 Testing

See detailed test plan: `/test-budget-import`  
See full guide: `/import-budget-guide`

---

## ✅ Status

- ✅ Database schema updated (uid is unique)
- ✅ Backend services enhanced
- ✅ Frontend UI redesigned
- ✅ Server restarted
- ✅ Ready to test!

**Next Step**: Try uploading a budget file and test the new field mapping feature!
