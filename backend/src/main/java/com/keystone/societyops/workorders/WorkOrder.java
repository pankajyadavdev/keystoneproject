package com.keystone.societyops.workorders;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "work_orders")
public class WorkOrder {
    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 20)
    private String reference;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 16)
    private String priority;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, length = 60)
    private String building;

    @Column(nullable = false, length = 80)
    private String unit;

    @Column(nullable = false, length = 120)
    private String requester;

    @Column(nullable = false, length = 120)
    private String assignedTo;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant dueAt;

    @Column(nullable = false, length = 2000)
    private String description;

    protected WorkOrder() { }

    public WorkOrder(String reference, String title, String category, String priority, String status,
                     String building, String unit, String requester, String assignedTo,
                     Instant createdAt, Instant dueAt, String description) {
        this.id = UUID.randomUUID().toString();
        this.reference = reference;
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.status = status;
        this.building = building;
        this.unit = unit;
        this.requester = requester;
        this.assignedTo = assignedTo;
        this.createdAt = createdAt;
        this.dueAt = dueAt;
        this.description = description;
    }

    public String getId() { return id; }
    public String getReference() { return reference; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public String getBuilding() { return building; }
    public String getUnit() { return unit; }
    public String getRequester() { return requester; }
    public String getAssignedTo() { return assignedTo; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDueAt() { return dueAt; }
    public String getDescription() { return description; }
    public void setStatus(String status) { this.status = status; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
}
