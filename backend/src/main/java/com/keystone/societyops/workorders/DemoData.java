package com.keystone.societyops.workorders;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoData implements CommandLineRunner {
    private final WorkOrderRepository repository;

    public DemoData(WorkOrderRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;
        Instant now = Instant.now();
        repository.saveAll(List.of(
                order("WO-2481", "Water leak in kitchen ceiling", "Plumbing", "Urgent", "In progress", "Tower A", "A-1204", "Meera Kapoor", "Rohan Mehta", now.minus(2, ChronoUnit.HOURS), now.plus(6, ChronoUnit.HOURS), "Water is dripping from the kitchen ceiling near the exhaust. Resident has shut off the sink supply."),
                order("WO-2480", "Lift B making unusual noise", "Elevator", "High", "Assigned", "Tower B", "Common area", "Security desk", "Sanjay Rao", now.minus(3, ChronoUnit.HOURS), now.plus(8, ChronoUnit.HOURS), "A rattling sound is coming from Lift B between floors 8 and 10."),
                order("WO-2479", "Replace corridor light fixtures", "Electrical", "Medium", "New", "Tower C", "Floor 6", "Anita Desai", "Unassigned", now.minus(20, ChronoUnit.HOURS), now.plus(30, ChronoUnit.HOURS), "Two lights outside apartment C-604 are not working."),
                order("WO-2478", "Pool filtration system check", "Facilities", "Low", "On hold", "Clubhouse", "Pool deck", "Facilities team", "Amit Shah", now.minus(2, ChronoUnit.DAYS), now.plus(2, ChronoUnit.DAYS), "Monthly check. Waiting for the replacement filter cartridge to arrive."),
                order("WO-2477", "Pest treatment — pantry", "Pest control", "High", "Completed", "Tower A", "A-0803", "Nikhil Sharma", "Farah Khan", now.minus(3, ChronoUnit.DAYS), now.minus(1, ChronoUnit.DAYS), "Ants reported near the kitchen pantry. Resident requested an evening visit."),
                order("WO-2476", "Generator room inspection", "Electrical", "Medium", "In progress", "Utility block", "Basement", "Operations", "Kiran Patel", now.minus(1, ChronoUnit.DAYS), now.plus(7, ChronoUnit.HOURS), "Quarterly generator room inspection and load test.")
        ));
    }

    private WorkOrder order(String reference, String title, String category, String priority, String status,
                            String building, String unit, String requester, String assignedTo,
                            Instant createdAt, Instant dueAt, String description) {
        return new WorkOrder(reference, title, category, priority, status, building, unit, requester,
                assignedTo, createdAt, dueAt, description);
    }
}
