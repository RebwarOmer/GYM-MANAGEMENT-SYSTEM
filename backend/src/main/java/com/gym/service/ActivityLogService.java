package com.gym.service;

import com.gym.enums.ActionType;
import com.gym.model.ActivityLog;
import com.gym.model.Member;
import com.gym.repository.ActivityLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    public ActivityLog log(Member member, ActionType actionType, String description) {
        ActivityLog activityLog = ActivityLog.builder()
                .member(member)
                .actionType(actionType)
                .description(description)
                .build();
        return activityLogRepository.save(activityLog);
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<ActivityLog> getLogsByMember(Long memberId) {
        return activityLogRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
    }

    @Transactional
    public void detachMember(Long memberId) {
        List<ActivityLog> logs = activityLogRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        logs.forEach(log -> log.setMember(null));
        activityLogRepository.saveAll(logs);
    }
}
