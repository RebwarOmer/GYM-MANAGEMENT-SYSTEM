package com.gym.repository;

import com.gym.model.ActivityLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    List<ActivityLog> findAllByOrderByCreatedAtDesc();
}
