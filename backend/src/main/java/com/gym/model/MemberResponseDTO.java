package com.gym.model;

import com.gym.enums.MemberStatus;
import com.gym.enums.SubscriptionStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponseDTO {
    private Long id;
    private String fullName;
    private String phone;
    private MemberStatus status;
    private LocalDateTime lastActivityAt;
    private LocalDateTime createdAt;
    private SubscriptionStatus latestSubscriptionStatus;
    private LocalDate latestSubscriptionStartDate;
    private LocalDate latestSubscriptionEndDate;
    private String latestOfferName;
}
