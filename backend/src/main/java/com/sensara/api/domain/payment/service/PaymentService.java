package com.sensara.api.domain.payment.service;

import com.sensara.api.domain.companion.repository.CompanionRepository;
import com.sensara.api.domain.payment.gateway.PaymentGateway;
import com.sensara.api.domain.payment.model.PaymentOrder;
import com.sensara.api.domain.payment.model.PaymentStatus;
import com.sensara.api.domain.payment.repository.PaymentOrderRepository;
import com.sensara.api.domain.plan.model.Subscription;
import com.sensara.api.domain.plan.repository.PlanRepository;
import com.sensara.api.domain.plan.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

        private final PaymentOrderRepository paymentRepository;
        private final CompanionRepository companionRepository;
        private final PlanRepository planRepository;
        private final SubscriptionRepository subscriptionRepository;
        private final PaymentGateway paymentGateway;

        @Transactional
        public PaymentOrder createCheckout(UUID companionId, UUID planId) {
                var companion = companionRepository.findById(companionId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Companion not found"));

                var plan = planRepository.findById(planId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));

                var order = PaymentOrder.builder()
                                .companion(companion)
                                .plan(plan)
                                .amount(plan.getPrice())
                                .build();

                // Chama o mock (futuramente o mercado pago real)
                String checkoutUrl = paymentGateway.generateCheckout(order);
                order.setCheckoutUrl(checkoutUrl);

                return paymentRepository.save(order);
        }

        // Este método será chamado pelo webhook do mercado pago
        @Transactional
        public void processWebhookApproval(String gatewayReference) {
                var order = paymentRepository.findByGatewayReference(gatewayReference)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Order not found"));

                if (order.getStatus() == PaymentStatus.APPROVED) {
                        return; // Já foi processado
                }

                order.setStatus(PaymentStatus.APPROVED);
                paymentRepository.save(order);

                // Ativa a assinatura
                var subscription = Subscription.builder()
                                .companion(order.getCompanion())
                                .plan(order.getPlan())
                                .startsAt(LocalDateTime.now())
                                .endsAt(LocalDateTime.now().plusDays(order.getPlan().getDurationDays()))
                                .active(true)
                                .build();

                // Desativa assinaturas antigas da acompanhante
                var oldSubscriptions = subscriptionRepository
                                .findByCompanionIdAndActiveTrue(order.getCompanion().getId());
                oldSubscriptions.forEach(sub -> sub.setActive(false));
                subscriptionRepository.saveAll(oldSubscriptions);

                subscriptionRepository.save(subscription);
        }
}