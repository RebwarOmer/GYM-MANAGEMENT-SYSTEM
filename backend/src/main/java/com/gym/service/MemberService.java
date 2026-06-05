package com.gym.service;

import com.gym.enums.ActionType;
import com.gym.enums.MemberStatus;
import com.gym.enums.SubscriptionStatus;
import com.gym.model.Member;
import com.gym.model.MemberDTO;
import com.gym.model.MemberResponseDTO;
import com.gym.model.Subscription;
import com.gym.repository.MemberRepository;
import com.gym.repository.SubscriptionRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;
    private final ActivityLogService activityLogService;

    @Transactional
    public MemberResponseDTO createMember(MemberDTO dto) {
        Member member = Member.builder()
                .fullName(dto.getFullName())
                .phone(dto.getPhone())
                .status(MemberStatus.ACTIVE)
                .build();
        Member savedMember = memberRepository.save(member);

        if (dto.getOfferId() != null) {
            subscriptionService.assignOffer(savedMember.getId(), dto.getOfferId());
        }

        activityLogService.log(savedMember, ActionType.ADD_MEMBER,
                "Added member: " + savedMember.getFullName());
        return toResponse(savedMember);
    }

    @Transactional
    public MemberResponseDTO updateMember(Long id, MemberDTO dto) {
        Member member = getMemberEntityById(id);
        member.setFullName(dto.getFullName());
        member.setPhone(dto.getPhone());
        member.setLastActivityAt(LocalDateTime.now());
        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public MemberResponseDTO stopMember(Long id) {
        Member member = getMemberEntityById(id);
        member.setStatus(MemberStatus.STOPPED);

        subscriptionService.getLatestSubscription(id).ifPresent(subscription -> {
            subscription.setStatus(SubscriptionStatus.STOPPED);
            subscriptionRepository.save(subscription);
        });

        Member savedMember = memberRepository.save(member);
        activityLogService.log(savedMember, ActionType.STOP_MEMBERSHIP,
                "Stopped membership for: " + savedMember.getFullName());
        return toResponse(savedMember);
    }

    @Transactional
    public MemberResponseDTO resumeMember(Long id) {
        Member member = getMemberEntityById(id);
        member.setStatus(MemberStatus.ACTIVE);

        subscriptionService.getLatestSubscription(id).ifPresent(subscription -> {
            if (subscription.getStatus() == SubscriptionStatus.STOPPED) {
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscriptionRepository.save(subscription);
            }
        });

        Member savedMember = memberRepository.save(member);
        activityLogService.log(savedMember, ActionType.RESUME_MEMBERSHIP,
                "Resumed membership for: " + savedMember.getFullName());
        return toResponse(savedMember);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = getMemberEntityById(id);
        String description = "Deleted member: " + member.getFullName();
        activityLogService.detachMember(id);
        subscriptionRepository.deleteByMemberId(id);
        activityLogService.log(null, ActionType.DELETE_MEMBER, description);
        memberRepository.delete(member);
    }

    public List<MemberResponseDTO> getAllMembers() {
        return memberRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public MemberResponseDTO getMemberById(Long id) {
        return toResponse(getMemberEntityById(id));
    }

    public Member getMemberEntityById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with id: " + id));
    }

    private MemberResponseDTO toResponse(Member member) {
        Subscription latest = subscriptionService.getLatestSubscription(member.getId()).orElse(null);
        return MemberResponseDTO.builder()
                .id(member.getId())
                .fullName(member.getFullName())
                .phone(member.getPhone())
                .status(member.getStatus())
                .lastActivityAt(member.getLastActivityAt())
                .createdAt(member.getCreatedAt())
                .latestSubscriptionStatus(latest == null ? null : latest.getStatus())
                .latestSubscriptionStartDate(latest == null ? null : latest.getStartDate())
                .latestSubscriptionEndDate(latest == null ? null : latest.getEndDate())
                .latestOfferName(latest == null || latest.getOffer() == null ? null : latest.getOffer().getName())
                .build();
    }
}
