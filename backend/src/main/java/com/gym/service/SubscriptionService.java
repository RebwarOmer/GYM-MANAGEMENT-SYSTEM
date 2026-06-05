package com.gym.service;

import com.gym.enums.ActionType;
import com.gym.enums.SubscriptionStatus;
import com.gym.model.Member;
import com.gym.model.Offer;
import com.gym.model.Subscription;
import com.gym.repository.MemberRepository;
import com.gym.repository.OfferRepository;
import com.gym.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;
    private final OfferRepository offerRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public Subscription assignOffer(Long memberId, Long offerId) {
        Member member = getMemberOrThrow(memberId);
        Offer offer = getOfferOrThrow(offerId);
        Subscription subscription = createActiveSubscription(member, offer);
        member.setLastActivityAt(LocalDateTime.now());
        memberRepository.save(member);
        return subscription;
    }

    @Transactional
    public Subscription renewSubscription(Long memberId, Long offerId) {
        Member member = getMemberOrThrow(memberId);
        Offer offer = getOfferOrThrow(offerId);

        getLatestSubscription(memberId).ifPresent(current -> {
            current.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(current);
        });

        Subscription subscription = createActiveSubscription(member, offer);
        member.setLastActivityAt(LocalDateTime.now());
        memberRepository.save(member);
        activityLogService.log(member, ActionType.RENEW_SUBSCRIPTION,
                "Renewed subscription with offer: " + offer.getName());
        return subscription;
    }

    public Optional<Subscription> getLatestSubscription(Long memberId) {
        return subscriptionRepository.findTopByMemberIdOrderByStartDateDesc(memberId);
    }

    public List<Subscription> getSubscriptionsByMember(Long memberId) {
        return subscriptionRepository.findByMemberId(memberId);
    }

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    @Scheduled(cron = "0 0 2 * * ?")
    public void updateExpiredSubscriptions() {
        LocalDate today = LocalDate.now();
        List<Subscription> activeSubscriptions = subscriptionRepository.findAll().stream()
                .filter(subscription -> subscription.getStatus() == SubscriptionStatus.ACTIVE)
                .filter(subscription -> subscription.getEndDate() != null)
                .filter(subscription -> subscription.getEndDate().isBefore(today))
                .toList();

        activeSubscriptions.forEach(subscription -> subscription.setStatus(SubscriptionStatus.EXPIRED));
        subscriptionRepository.saveAll(activeSubscriptions);
    }

    private Subscription createActiveSubscription(Member member, Offer offer) {
        LocalDate today = LocalDate.now();
        Subscription subscription = Subscription.builder()
                .member(member)
                .offer(offer)
                .startDate(today)
                .endDate(today.plusDays(offer.getDurationDays()))
                .status(SubscriptionStatus.ACTIVE)
                .build();
        return subscriptionRepository.save(subscription);
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + memberId));
    }

    private Offer getOfferOrThrow(Long offerId) {
        return offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found with id: " + offerId));
    }
}
