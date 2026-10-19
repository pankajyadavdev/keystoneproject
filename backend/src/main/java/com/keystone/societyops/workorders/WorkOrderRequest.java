package com.keystone.societyops.workorders;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record WorkOrderRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 50) String category,
        @NotBlank @Size(max = 16) String priority,
        @NotBlank @Size(max = 20) String status,
        @NotBlank @Size(max = 60) String building,
        @NotBlank @Size(max = 80) String unit,
        @NotBlank @Size(max = 120) String requester,
        @NotBlank @Size(max = 120) String assignedTo,
        @NotNull Instant dueAt,
        @NotBlank @Size(max = 2000) String description
) { }
