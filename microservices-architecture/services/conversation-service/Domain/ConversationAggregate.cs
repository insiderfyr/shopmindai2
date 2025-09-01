using LibreChat.Shared.Contracts.Events;
using LibreChat.ConversationService.Domain.Events;
using LibreChat.ConversationService.Domain.ValueObjects;

namespace LibreChat.ConversationService.Domain;

/// <summary>
/// Conversation Aggregate Root - Domain-Driven Design
/// Implements Event Sourcing pattern for full auditability
/// </summary>
public class ConversationAggregate : AggregateRoot<ConversationId>
{
    private readonly List<Message> _messages = new();
    private readonly List<string> _tags = new();
    private readonly Dictionary<string, string> _metadata = new();

    public UserId UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public ModelId ModelId { get; private set; }
    public EndpointId EndpointId { get; private set; }
    public IReadOnlyList<Message> Messages => _messages.AsReadOnly();
    public IReadOnlyList<string> Tags => _tags.AsReadOnly();
    public IReadOnlyDictionary<string, string> Metadata => _metadata.AsReadOnly();
    public bool IsArchived { get; private set; }
    public bool IsPinned { get; private set; }
    public ConversationId? ParentConversationId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public DateTime LastActivity { get; private set; }
    public ConversationStatus Status { get; private set; }
    public ShareSettings? ShareSettings { get; private set; }

    // Private constructor for Event Sourcing reconstruction
    private ConversationAggregate() { }

    // Factory method for creating new conversations
    public static ConversationAggregate Create(
        ConversationId id,
        UserId userId,
        string title,
        ModelId modelId,
        EndpointId endpointId,
        IEnumerable<string>? tags = null,
        Dictionary<string, string>? metadata = null,
        ConversationId? parentConversationId = null)
    {
        var conversation = new ConversationAggregate();
        
        var @event = new ConversationCreatedEvent(
            id,
            userId,
            title,
            modelId,
            endpointId,
            tags?.ToList() ?? new List<string>(),
            metadata ?? new Dictionary<string, string>(),
            parentConversationId,
            DateTime.UtcNow
        );

        conversation.ApplyEvent(@event);
        return conversation;
    }

    // Business methods that generate domain events
    public MessageId AddMessage(
        string role,
        string content,
        IEnumerable<MessageContent>? contentParts = null,
        MessageId? parentMessageId = null,
        Dictionary<string, string>? metadata = null,
        IEnumerable<string>? attachments = null,
        bool isStreaming = false)
    {
        if (Status != ConversationStatus.Active)
        {
            throw new InvalidOperationException("Cannot add message to inactive conversation");
        }

        var messageId = MessageId.New();
        var @event = new MessageAddedEvent(
            messageId,
            Id,
            UserId,
            role,
            content,
            contentParts?.ToList() ?? new List<MessageContent>(),
            parentMessageId,
            metadata ?? new Dictionary<string, string>(),
            attachments?.ToList() ?? new List<string>(),
            isStreaming,
            DateTime.UtcNow
        );

        ApplyEvent(@event);
        return messageId;
    }

    public void UpdateMessage(
        MessageId messageId,
        string? content = null,
        IEnumerable<MessageContent>? contentParts = null,
        Dictionary<string, string>? metadata = null,
        IEnumerable<string>? attachments = null)
    {
        var message = _messages.FirstOrDefault(m => m.Id == messageId);
        if (message == null)
        {
            throw new InvalidOperationException($"Message {messageId} not found in conversation");
        }

        var @event = new MessageUpdatedEvent(
            messageId,
            Id,
            UserId,
            content ?? message.Content,
            contentParts?.ToList() ?? message.ContentParts,
            metadata ?? message.Metadata.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            attachments?.ToList() ?? message.Attachments,
            DateTime.UtcNow,
            UserId // Updated by
        );

        ApplyEvent(@event);
    }

    public void UpdateTitle(string newTitle)
    {
        if (string.IsNullOrWhiteSpace(newTitle))
        {
            throw new ArgumentException("Title cannot be empty", nameof(newTitle));
        }

        var @event = new ConversationTitleUpdatedEvent(Id, UserId, newTitle, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void AddTag(string tag)
    {
        if (string.IsNullOrWhiteSpace(tag))
        {
            throw new ArgumentException("Tag cannot be empty", nameof(tag));
        }

        if (_tags.Contains(tag))
        {
            return; // Tag already exists
        }

        var @event = new ConversationTagAddedEvent(Id, UserId, tag, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void RemoveTag(string tag)
    {
        if (!_tags.Contains(tag))
        {
            return; // Tag doesn't exist
        }

        var @event = new ConversationTagRemovedEvent(Id, UserId, tag, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void Archive()
    {
        if (IsArchived)
        {
            return; // Already archived
        }

        var @event = new ConversationArchivedEvent(Id, UserId, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void Unarchive()
    {
        if (!IsArchived)
        {
            return; // Not archived
        }

        var @event = new ConversationUnarchivedEvent(Id, UserId, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void Pin()
    {
        if (IsPinned)
        {
            return; // Already pinned
        }

        var @event = new ConversationPinnedEvent(Id, UserId, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public void Unpin()
    {
        if (!IsPinned)
        {
            return; // Not pinned
        }

        var @event = new ConversationUnpinnedEvent(Id, UserId, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    public ShareId ShareConversation(
        ShareSettings shareSettings,
        DateTime? expiresAt = null)
    {
        var shareId = ShareId.New();
        var @event = new ConversationSharedEvent(
            Id,
            UserId,
            shareId,
            shareSettings,
            DateTime.UtcNow,
            expiresAt
        );

        ApplyEvent(@event);
        return shareId;
    }

    public void DeleteMessage(MessageId messageId, bool permanent = false)
    {
        var message = _messages.FirstOrDefault(m => m.Id == messageId);
        if (message == null)
        {
            throw new InvalidOperationException($"Message {messageId} not found in conversation");
        }

        var @event = new MessageDeletedEvent(
            messageId,
            Id,
            UserId,
            permanent,
            DateTime.UtcNow
        );

        ApplyEvent(@event);
    }

    public void Delete(bool permanent = false)
    {
        var @event = new ConversationDeletedEvent(Id, UserId, permanent, DateTime.UtcNow);
        ApplyEvent(@event);
    }

    // Event application methods for Event Sourcing
    protected override void When(IDomainEvent @event)
    {
        switch (@event)
        {
            case ConversationCreatedEvent e:
                Apply(e);
                break;
            case MessageAddedEvent e:
                Apply(e);
                break;
            case MessageUpdatedEvent e:
                Apply(e);
                break;
            case ConversationTitleUpdatedEvent e:
                Apply(e);
                break;
            case ConversationTagAddedEvent e:
                Apply(e);
                break;
            case ConversationTagRemovedEvent e:
                Apply(e);
                break;
            case ConversationArchivedEvent e:
                Apply(e);
                break;
            case ConversationUnarchivedEvent e:
                Apply(e);
                break;
            case ConversationPinnedEvent e:
                Apply(e);
                break;
            case ConversationUnpinnedEvent e:
                Apply(e);
                break;
            case ConversationSharedEvent e:
                Apply(e);
                break;
            case MessageDeletedEvent e:
                Apply(e);
                break;
            case ConversationDeletedEvent e:
                Apply(e);
                break;
            default:
                throw new InvalidOperationException($"Unknown event type: {@event.GetType().Name}");
        }
    }

    private void Apply(ConversationCreatedEvent @event)
    {
        Id = @event.ConversationId;
        UserId = @event.UserId;
        Title = @event.Title;
        ModelId = @event.ModelId;
        EndpointId = @event.EndpointId;
        ParentConversationId = @event.ParentConversationId;
        CreatedAt = @event.CreatedAt;
        UpdatedAt = @event.CreatedAt;
        LastActivity = @event.CreatedAt;
        Status = ConversationStatus.Active;

        foreach (var tag in @event.Tags)
        {
            _tags.Add(tag);
        }

        foreach (var kvp in @event.Metadata)
        {
            _metadata[kvp.Key] = kvp.Value;
        }
    }

    private void Apply(MessageAddedEvent @event)
    {
        var message = new Message(
            @event.MessageId,
            @event.ConversationId,
            @event.UserId,
            @event.Role,
            @event.Content,
            @event.ContentParts,
            @event.ParentMessageId,
            @event.Metadata,
            @event.Attachments,
            @event.IsStreaming,
            @event.AddedAt,
            MessageStatus.Sent
        );

        _messages.Add(message);
        LastActivity = @event.AddedAt;
        UpdatedAt = @event.AddedAt;
    }

    private void Apply(MessageUpdatedEvent @event)
    {
        var message = _messages.FirstOrDefault(m => m.Id == @event.MessageId);
        if (message != null)
        {
            message.UpdateContent(@event.Content, @event.ContentParts, @event.Metadata, @event.Attachments);
            LastActivity = @event.UpdatedAt;
            UpdatedAt = @event.UpdatedAt;
        }
    }

    private void Apply(ConversationTitleUpdatedEvent @event)
    {
        Title = @event.NewTitle;
        UpdatedAt = @event.UpdatedAt;
        LastActivity = @event.UpdatedAt;
    }

    private void Apply(ConversationTagAddedEvent @event)
    {
        if (!_tags.Contains(@event.Tag))
        {
            _tags.Add(@event.Tag);
        }
        UpdatedAt = @event.AddedAt;
    }

    private void Apply(ConversationTagRemovedEvent @event)
    {
        _tags.Remove(@event.Tag);
        UpdatedAt = @event.RemovedAt;
    }

    private void Apply(ConversationArchivedEvent @event)
    {
        IsArchived = true;
        Status = ConversationStatus.Archived;
        UpdatedAt = @event.ArchivedAt;
    }

    private void Apply(ConversationUnarchivedEvent @event)
    {
        IsArchived = false;
        Status = ConversationStatus.Active;
        UpdatedAt = @event.UnarchivedAt;
    }

    private void Apply(ConversationPinnedEvent @event)
    {
        IsPinned = true;
        UpdatedAt = @event.PinnedAt;
    }

    private void Apply(ConversationUnpinnedEvent @event)
    {
        IsPinned = false;
        UpdatedAt = @event.UnpinnedAt;
    }

    private void Apply(ConversationSharedEvent @event)
    {
        ShareSettings = @event.ShareSettings;
        UpdatedAt = @event.SharedAt;
    }

    private void Apply(MessageDeletedEvent @event)
    {
        if (@event.Permanent)
        {
            _messages.RemoveAll(m => m.Id == @event.MessageId);
        }
        else
        {
            var message = _messages.FirstOrDefault(m => m.Id == @event.MessageId);
            if (message != null)
            {
                message.MarkAsDeleted(@event.DeletedAt);
            }
        }
        
        LastActivity = @event.DeletedAt;
        UpdatedAt = @event.DeletedAt;
    }

    private void Apply(ConversationDeletedEvent @event)
    {
        if (@event.Permanent)
        {
            Status = ConversationStatus.Deleted;
        }
        else
        {
            Status = ConversationStatus.SoftDeleted;
        }
        
        UpdatedAt = @event.DeletedAt;
    }

    // Snapshot support for performance optimization
    public ConversationSnapshot CreateSnapshot()
    {
        return new ConversationSnapshot(
            Id,
            UserId,
            Title,
            ModelId,
            EndpointId,
            _messages.ToList(),
            _tags.ToList(),
            _metadata.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            IsArchived,
            IsPinned,
            ParentConversationId,
            CreatedAt,
            UpdatedAt,
            LastActivity,
            Status,
            ShareSettings,
            Version
        );
    }

    public static ConversationAggregate FromSnapshot(ConversationSnapshot snapshot)
    {
        var conversation = new ConversationAggregate
        {
            Id = snapshot.Id,
            UserId = snapshot.UserId,
            Title = snapshot.Title,
            ModelId = snapshot.ModelId,
            EndpointId = snapshot.EndpointId,
            IsArchived = snapshot.IsArchived,
            IsPinned = snapshot.IsPinned,
            ParentConversationId = snapshot.ParentConversationId,
            CreatedAt = snapshot.CreatedAt,
            UpdatedAt = snapshot.UpdatedAt,
            LastActivity = snapshot.LastActivity,
            Status = snapshot.Status,
            ShareSettings = snapshot.ShareSettings
        };

        foreach (var message in snapshot.Messages)
        {
            conversation._messages.Add(message);
        }

        foreach (var tag in snapshot.Tags)
        {
            conversation._tags.Add(tag);
        }

        foreach (var kvp in snapshot.Metadata)
        {
            conversation._metadata[kvp.Key] = kvp.Value;
        }

        conversation.Version = snapshot.Version;
        conversation.ClearEvents(); // Snapshot doesn't need events

        return conversation;
    }

    // Business rules validation
    public bool CanAddMessage(UserId userId)
    {
        return Status == ConversationStatus.Active && 
               (UserId == userId || ShareSettings?.AllowEdits == true);
    }

    public bool CanUpdateMessage(MessageId messageId, UserId userId)
    {
        var message = _messages.FirstOrDefault(m => m.Id == messageId);
        return message != null && 
               message.UserId == userId && 
               Status == ConversationStatus.Active &&
               DateTime.UtcNow.Subtract(message.CreatedAt).TotalMinutes < 15; // 15-minute edit window
    }

    public bool CanShare(UserId userId)
    {
        return UserId == userId && Status == ConversationStatus.Active;
    }

    public bool CanDelete(UserId userId)
    {
        return UserId == userId;
    }

    // Analytics methods
    public ConversationStatistics GetStatistics()
    {
        var userMessages = _messages.Count(m => m.Role == "user");
        var assistantMessages = _messages.Count(m => m.Role == "assistant");
        var systemMessages = _messages.Count(m => m.Role == "system");

        var totalTokens = _messages.Sum(m => m.EstimatedTokens);
        var averageResponseTime = _messages
            .Where(m => m.Role == "assistant")
            .Average(m => m.ResponseTimeMs ?? 0);

        return new ConversationStatistics(
            Id,
            _messages.Count,
            userMessages,
            assistantMessages,
            systemMessages,
            totalTokens,
            _messages.FirstOrDefault()?.CreatedAt ?? CreatedAt,
            _messages.LastOrDefault()?.CreatedAt ?? CreatedAt,
            averageResponseTime
        );
    }

    // Event sourcing infrastructure
    public void LoadFromHistory(IEnumerable<IDomainEvent> events)
    {
        foreach (var @event in events)
        {
            When(@event);
            Version++;
        }
        
        ClearEvents(); // Clear events after loading from history
    }

    public void MarkEventsAsCommitted()
    {
        ClearEvents();
    }

    // Invariant validation
    protected override void ValidateInvariants()
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            throw new DomainException("Conversation title cannot be empty");
        }

        if (_messages.Count > 10000) // Prevent extremely large conversations
        {
            throw new DomainException("Conversation has too many messages. Consider archiving.");
        }

        if (_tags.Count > 50) // Reasonable tag limit
        {
            throw new DomainException("Conversation has too many tags");
        }
    }
}

// Base aggregate root class
public abstract class AggregateRoot<TId> where TId : ValueObject
{
    private readonly List<IDomainEvent> _events = new();

    public TId Id { get; protected set; } = default!;
    public long Version { get; protected set; }

    public IReadOnlyList<IDomainEvent> Events => _events.AsReadOnly();

    protected void ApplyEvent(IDomainEvent @event)
    {
        When(@event);
        _events.Add(@event);
        Version++;
    }

    protected abstract void When(IDomainEvent @event);

    protected void ClearEvents()
    {
        _events.Clear();
    }

    protected virtual void ValidateInvariants() { }
}

// Domain exception
public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
    public DomainException(string message, Exception innerException) : base(message, innerException) { }
}