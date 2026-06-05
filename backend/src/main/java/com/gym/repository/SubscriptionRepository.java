package com.gym.repository;

import com.gym.model.Subscription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByMemberId(Long memberId);

    Optional<Subscription> findTopByMemberIdOrderByStartDateDesc(Long memberId);

    void deleteByMemberId(Long memberId);
}
