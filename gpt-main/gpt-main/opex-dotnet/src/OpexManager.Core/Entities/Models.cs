using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OpexManager.Core.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<CurrencyRate> CurrencyRates { get; set; } = new List<CurrencyRate>();
    public virtual ICollection<UserActivityLog> ActivityLogs { get; set; } = new List<UserActivityLog>();
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<ImportJob> ImportJobs { get; set; } = new List<ImportJob>();
    public virtual ICollection<SavedView> SavedViews { get; set; } = new List<SavedView>();
    public virtual ICollection<ReconciliationNote> ReconciliationNotes { get; set; } = new List<ReconciliationNote>();
}

[Table("roles")]
public class Role
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

[Table("user_roles")]
public class UserRole
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("RoleId")]
    public virtual Role Role { get; set; } = null!;
}

[Table("towers")]
public class Tower
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<BudgetHead> BudgetHeads { get; set; } = new List<BudgetHead>();
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
    public virtual ICollection<PO> POs { get; set; } = new List<PO>();
}

[Table("budget_heads")]
public class BudgetHead
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("tower_id")]
    public int TowerId { get; set; }

    // Navigation properties
    [ForeignKey("TowerId")]
    public virtual Tower Tower { get; set; } = null!;
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
    public virtual ICollection<PO> POs { get; set; } = new List<PO>();
}

[Table("vendors")]
public class Vendor
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("gst_number")]
    public string? GstNumber { get; set; }

    [MaxLength(255)]
    [Column("contact_person")]
    public string? ContactPerson { get; set; }

    // Navigation properties
    public virtual ICollection<PO> POs { get; set; } = new List<PO>();
    public virtual ICollection<Actual> Actuals { get; set; } = new List<Actual>();
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("cost_centres")]
public class CostCentre
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("code")]
    public string Code { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("po_entities")]
public class POEntity
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("service_types")]
public class ServiceType
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("allocation_basis")]
public class AllocationBasis
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("fiscal_years")]
public class FiscalYear
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = false;

    // Navigation properties
    public virtual ICollection<LineItem> LineItems { get; set; } = new List<LineItem>();
}

[Table("line_items")]
public class LineItem
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("uid")]
    public string Uid { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("parent_uid")]
    public string? ParentUid { get; set; }

    [Required]
    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("tower_id")]
    public int? TowerId { get; set; }

    [Column("budget_head_id")]
    public int? BudgetHeadId { get; set; }

    [Column("cost_centre_id")]
    public int? CostCentreId { get; set; }

    [Column("fiscal_year_id")]
    public int? FiscalYearId { get; set; }

    [Column("vendor_id")]
    public int? VendorId { get; set; }

    [Column("service_start_date")]
    public DateTime? ServiceStartDate { get; set; }

    [Column("service_end_date")]
    public DateTime? ServiceEndDate { get; set; }

    [MaxLength(100)]
    [Column("contract_id")]
    public string? ContractId { get; set; }

    [Column("po_entity_id")]
    public int? PoEntityId { get; set; }

    [Column("allocation_basis_id")]
    public int? AllocationBasisId { get; set; }

    [Column("service_type_id")]
    public int? ServiceTypeId { get; set; }

    [Column("total_budget", TypeName = "decimal(15,2)")]
    public decimal TotalBudget { get; set; } = 0;

    [MaxLength(10)]
    [Column("currency")]
    public string Currency { get; set; } = "INR";

    [Column("remarks")]
    public string? Remarks { get; set; }

    [Column("created_by")]
    public int? CreatedBy { get; set; }

    [Column("updated_by")]
    public int? UpdatedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // New fields
    [Column("renewal_date")]
    public DateTime? RenewalDate { get; set; }

    [MaxLength(50)]
    [Column("initiative_type")]
    public string? InitiativeType { get; set; }

    [MaxLength(50)]
    [Column("priority")]
    public string? Priority { get; set; }

    [MaxLength(50)]
    [Column("cost_optimization_lever")]
    public string? CostOptimizationLever { get; set; }

    [MaxLength(50)]
    [Column("allocation_type")]
    public string? AllocationType { get; set; }

    [Column("has_contract")]
    public bool HasContract { get; set; } = false;

    [Column("is_shared_service")]
    public bool IsSharedService { get; set; } = false;

    // Navigation properties
    [ForeignKey("TowerId")]
    public virtual Tower? Tower { get; set; }

    [ForeignKey("BudgetHeadId")]
    public virtual BudgetHead? BudgetHead { get; set; }

    [ForeignKey("CostCentreId")]
    public virtual CostCentre? CostCentre { get; set; }

    [ForeignKey("FiscalYearId")]
    public virtual FiscalYear? FiscalYear { get; set; }

    [ForeignKey("VendorId")]
    public virtual Vendor? Vendor { get; set; }

    [ForeignKey("PoEntityId")]
    public virtual POEntity? PoEntity { get; set; }

    [ForeignKey("AllocationBasisId")]
    public virtual AllocationBasis? AllocationBasis { get; set; }

    [ForeignKey("ServiceTypeId")]
    public virtual ServiceType? ServiceType { get; set; }

    public virtual ICollection<BudgetMonth> BudgetMonths { get; set; } = new List<BudgetMonth>();
    public virtual ICollection<Actual> Actuals { get; set; } = new List<Actual>();
    public virtual ICollection<POLineItem> POLineItems { get; set; } = new List<POLineItem>();
    public virtual ICollection<ReconciliationNote> ReconciliationNotes { get; set; } = new List<ReconciliationNote>();
}

[Table("budget_months")]
public class BudgetMonth
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("line_item_id")]
    public int LineItemId { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("month")]
    public string Month { get; set; } = string.Empty;

    [Column("amount", TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; } = 0;

    // Navigation properties
    [ForeignKey("LineItemId")]
    public virtual LineItem LineItem { get; set; } = null!;
}

[Table("pos")]
public class PO
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("po_number")]
    public int PoNumber { get; set; }

    [Column("po_date")]
    public DateTime PoDate { get; set; }

    [Column("pr_number")]
    public int? PrNumber { get; set; }

    [Column("pr_date")]
    public DateTime? PrDate { get; set; }

    [Column("pr_amount", TypeName = "decimal(15,2)")]
    public decimal? PrAmount { get; set; }

    [Column("vendor_id")]
    public int? VendorId { get; set; }

    [MaxLength(10)]
    [Column("currency")]
    public string Currency { get; set; } = "INR";

    [Column("po_value", TypeName = "decimal(15,2)")]
    public decimal PoValue { get; set; }

    [Column("exchange_rate", TypeName = "decimal(10,4)")]
    public decimal? ExchangeRate { get; set; }

    [Column("common_currency_value", TypeName = "decimal(15,2)")]
    public decimal? CommonCurrencyValue { get; set; }

    [Column("value_in_lac", TypeName = "decimal(15,2)")]
    public decimal? ValueInLac { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string? Status { get; set; }

    [Column("tower_id")]
    public int? TowerId { get; set; }

    [Column("budget_head_id")]
    public int? BudgetHeadId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("VendorId")]
    public virtual Vendor? Vendor { get; set; }

    [ForeignKey("TowerId")]
    public virtual Tower? Tower { get; set; }

    [ForeignKey("BudgetHeadId")]
    public virtual BudgetHead? BudgetHead { get; set; }

    public virtual ICollection<POLineItem> POLineItems { get; set; } = new List<POLineItem>();
}

[Table("po_line_items")]
public class POLineItem
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("po_id")]
    public int PoId { get; set; }

    [Column("line_item_id")]
    public int LineItemId { get; set; }

    [Column("allocated_amount", TypeName = "decimal(15,2)")]
    public decimal AllocatedAmount { get; set; } = 0;

    // Navigation properties
    [ForeignKey("PoId")]
    public virtual PO PO { get; set; } = null!;

    [ForeignKey("LineItemId")]
    public virtual LineItem LineItem { get; set; } = null!;
}

[Table("actuals")]
public class Actual
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [MaxLength(100)]
    [Column("invoice_no")]
    public string? InvoiceNo { get; set; }

    [Column("invoice_date")]
    public DateTime InvoiceDate { get; set; }

    [Column("amount", TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }

    [MaxLength(10)]
    [Column("currency")]
    public string Currency { get; set; } = "INR";

    [Column("converted_amount", TypeName = "decimal(15,2)")]
    public decimal? ConvertedAmount { get; set; }

    [Column("line_item_id")]
    public int? LineItemId { get; set; }

    [MaxLength(20)]
    [Column("month")]
    public string? Month { get; set; }

    [Column("vendor_id")]
    public int? VendorId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("LineItemId")]
    public virtual LineItem? LineItem { get; set; }

    [ForeignKey("VendorId")]
    public virtual Vendor? Vendor { get; set; }

    public virtual ICollection<ReconciliationNote> ReconciliationNotes { get; set; } = new List<ReconciliationNote>();
}

[Table("audit_logs")]
public class AuditLog
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("entity")]
    public string Entity { get; set; } = string.Empty;

    [Column("entity_id")]
    public int? EntityId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("diff", TypeName = "json")]
    public string? Diff { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}

[Table("user_activity_logs")]
public class UserActivityLog
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [MaxLength(255)]
    [Column("username")]
    public string? Username { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("action")]
    public string Action { get; set; } = string.Empty;

    [Column("details")]
    public string? Details { get; set; }

    [MaxLength(45)]
    [Column("ip_address")]
    public string? IpAddress { get; set; }

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User? User { get; set; }
}

[Table("currency_rates")]
public class CurrencyRate
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("from_currency")]
    public string FromCurrency { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("to_currency")]
    public string ToCurrency { get; set; } = string.Empty;

    [Column("rate", TypeName = "decimal(10,4)")]
    public decimal Rate { get; set; }

    [Column("effective_date")]
    public DateTime EffectiveDate { get; set; }

    [Column("updated_by_id")]
    public int? UpdatedById { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UpdatedById")]
    public virtual User? UpdatedBy { get; set; }
}

[Table("import_jobs")]
public class ImportJob
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("filename")]
    public string Filename { get; set; } = string.Empty;

    [Column("file_size")]
    public int FileSize { get; set; }

    [Column("rows_total")]
    public int RowsTotal { get; set; }

    [Column("rows_accepted")]
    public int RowsAccepted { get; set; }

    [Column("rows_rejected")]
    public int RowsRejected { get; set; }

    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "pending";

    [Required]
    [MaxLength(50)]
    [Column("import_type")]
    public string ImportType { get; set; } = string.Empty;

    [Column("metadata", TypeName = "json")]
    public string? Metadata { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}

[Table("saved_views")]
public class SavedView
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("filters", TypeName = "json")]
    public string Filters { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("page")]
    public string Page { get; set; } = string.Empty;

    [Column("is_default")]
    public bool IsDefault { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}

[Table("reconciliation_notes")]
public class ReconciliationNote
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("line_item_id")]
    public int LineItemId { get; set; }

    [Column("actual_id")]
    public int? ActualId { get; set; }

    [Required]
    [Column("note")]
    public string Note { get; set; } = string.Empty;

    [Column("created_by")]
    public int CreatedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("LineItemId")]
    public virtual LineItem LineItem { get; set; } = null!;

    [ForeignKey("ActualId")]
    public virtual Actual? Actual { get; set; }

    [ForeignKey("CreatedBy")]
    public virtual User User { get; set; } = null!;
}
