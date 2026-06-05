package com.gym.controller;

import com.gym.model.Subscription;
import com.gym.model.SubscriptionRequestDTO;
import com.gym.service.SubscriptionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping("/assign")
    public ResponseEntity<Subscription> assignOffer(@RequestBody SubscriptionRequestDTO dto) {
        return ResponseEntity.ok(subscriptionService.assignOffer(dto.getMemberId(), dto.getOfferId()));
    }

    @PostMapping("/renew")
    public ResponseEntity<Subscription> renewSubscription(@RequestBody SubscriptionRequestDTO dto) {
        return ResponseEntity.ok(subscriptionService.renewSubscription(dto.getMemberId(), dto.getOfferId()));
    }

    @GetMapping("/member/{id}")
    public ResponseEntity<List<Subscription>> getSubscriptionsByMember(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByMember(id));
    }
}
