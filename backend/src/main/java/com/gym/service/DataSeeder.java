package com.gym.service;

import com.gym.model.Offer;
import com.gym.model.User;
import com.gym.repository.OfferRepository;
import com.gym.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final OfferRepository offerRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (offerRepository.count() == 0) {
            offerRepository.save(Offer.builder()
                    .name("1 Month")
                    .durationDays(30)
                    .priceIqd(30000)
                    .build());
            offerRepository.save(Offer.builder()
                    .name("3 Months")
                    .durationDays(90)
                    .priceIqd(75000)
                    .build());
            offerRepository.save(Offer.builder()
                    .name("6 Months")
                    .durationDays(180)
                    .priceIqd(160000)
                    .build());
        }

        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .passwordHash("admin123")
                    .role("ADMIN")
                    .build());
        }
    }
}
