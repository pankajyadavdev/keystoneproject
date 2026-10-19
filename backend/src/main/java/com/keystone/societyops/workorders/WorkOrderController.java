package com.keystone.societyops.workorders;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {
    private final WorkOrderRepository repository;

    public WorkOrderController(WorkOrderRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<WorkOrder> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public WorkOrder create(@Valid @RequestBody WorkOrderRequest request) {
        long latestNumber = repository.findTopByOrderByReferenceDesc()
                .map(order -> Long.parseLong(order.getReference().substring(3)))
                .orElse(2480L);
        String reference = "WO-" + (latestNumber + 1);
        WorkOrder order = new WorkOrder(reference, request.title(), request.category(), request.priority(),
                request.status(), request.building(), request.unit(), request.requester(), request.assignedTo(),
                Instant.now(), request.dueAt(), request.description());
        return repository.save(order);
    }

    @PatchMapping("/{id}/status")
    public WorkOrder changeStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || !List.of("New", "Assigned", "In progress", "On hold", "Completed").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported work order status");
        }
        WorkOrder order = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work order not found"));
        order.setStatus(status);
        return repository.save(order);
    }

    @PatchMapping("/{id}/assignment")
    public WorkOrder assign(@PathVariable String id, @RequestBody Map<String, String> body) {
        String assignee = body.get("assignedTo");
        if (assignee == null || assignee.isBlank() || assignee.length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A technician is required");
        }
        WorkOrder order = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Work order not found"));
        order.setAssignedTo(assignee);
        if ("New".equals(order.getStatus())) order.setStatus("Assigned");
        return repository.save(order);
    }
}
