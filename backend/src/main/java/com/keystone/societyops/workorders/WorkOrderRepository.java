package com.keystone.societyops.workorders;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, String> {
    List<WorkOrder> findAllByOrderByCreatedAtDesc();
    Optional<WorkOrder> findTopByOrderByReferenceDesc();
}
