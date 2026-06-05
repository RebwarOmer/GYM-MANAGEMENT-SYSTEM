package com.gym.repository;

import com.gym.enums.MemberStatus;
import com.gym.model.Member;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByStatus(MemberStatus status);

    List<Member> findByLastActivityAtBefore(LocalDateTime cutoff);
}
