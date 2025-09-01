using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace LibreChat.IdentityService.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Bio { get; set; }
    
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }
    
    public bool EmailVerified { get; set; }
    
    public bool TwoFactorEnabled { get; set; }
    
    public string? TwoFactorSecret { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    public UserStatus Status { get; set; } = UserStatus.Active;
    
    public string? InviteToken { get; set; }
    
    public DateTime? InviteTokenExpiresAt { get; set; }
    
    public string? InvitedBy { get; set; }
    
    // Navigation properties
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
    
    public virtual ICollection<UserSession> Sessions { get; set; } = new List<UserSession>();
    
    public virtual ICollection<UserPreference> Preferences { get; set; } = new List<UserPreference>();
    
    public virtual ICollection<UserInvite> SentInvites { get; set; } = new List<UserInvite>();
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    public bool IsActive => Status == UserStatus.Active;
    
    public bool IsSuspended => Status == UserStatus.Suspended;
    
    public bool IsBanned => Status == UserStatus.Banned;
    
    public bool IsDeleted => Status == UserStatus.Deleted;
}

public class ApplicationRole : IdentityRole
{
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsSystem { get; set; }
    
    public int Priority { get; set; }
    
    // Navigation properties
    public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
    
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class ApplicationUserRole : IdentityUserRole<string>
{
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    
    public string AssignedBy { get; set; } = string.Empty;
    
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ApplicationRole Role { get; set; } = null!;
}

public class RolePermission
{
    public int Id { get; set; }
    
    public string RoleId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Permission { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ApplicationRole Role { get; set; } = null!;
}

public class UserSession
{
    public string Id { get; set; } = string.Empty;
    
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string DeviceId { get; set; } = string.Empty;
    
    [MaxLength(45)]
    public string? IpAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime ExpiresAt { get; set; }
    
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public string? RevokedReason { get; set; }
    
    public DateTime? RevokedAt { get; set; }
    
    public string? RevokedBy { get; set; }
    
    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
}

public class UserPreference
{
    public int Id { get; set; }
    
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Value { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
}

public class UserInvite
{
    public string Id { get; set; } = string.Empty;
    
    public string InvitedByUserId { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Token { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime ExpiresAt { get; set; }
    
    public DateTime? AcceptedAt { get; set; }
    
    public string? AcceptedByUserId { get; set; }
    
    public InviteStatus Status { get; set; } = InviteStatus.Pending;
    
    public string? Role { get; set; }
    
    [MaxLength(500)]
    public string? Message { get; set; }
    
    // Navigation properties
    public virtual ApplicationUser InvitedByUser { get; set; } = null!;
    public virtual ApplicationUser? AcceptedByUser { get; set; }
}

public enum UserStatus
{
    Active = 1,
    Suspended = 2,
    Banned = 3,
    Deleted = 4
}

public enum InviteStatus
{
    Pending = 1,
    Accepted = 2,
    Expired = 3,
    Cancelled = 4
}