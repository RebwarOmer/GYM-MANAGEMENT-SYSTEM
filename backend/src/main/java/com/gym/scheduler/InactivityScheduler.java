package com.gym.scheduler;

import com.gym.enums.ActionType;
import com.gym.model.Member;
import com.gym.repository.MemberRepository;
import com.gym.repository.SubscriptionRepository;
import com.gym.service.ActivityLogService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class InactivityScheduler {
    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ActivityLogService activityLogService;

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void deleteInactiveMembers() {
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(4);
        List<Member> inactiveMembers = memberRepository.findByLastActivityAtBefore(cutoff);

        inactiveMembers.forEach(member -> {
            Long memberId = member.getId();
            String description = "Auto deleted inactive member: " + member.getFullName();
            activityLogService.detachMember(memberId);
            subscriptionRepository.deleteByMemberId(memberId);
            activityLogService.log(null, ActionType.AUTO_DELETED, description);
            memberRepository.delete(member);
        });
    }
}
