package com.sensara.api.domain.payment.controller;

import com.sensara.api.domain.payment.model.PaymentOrder;
import com.sensara.api.domain.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    public record CheckoutRequest(UUID planId) {
    }

    public record CheckoutResponse(UUID orderId, String checkoutUrl) {
    }

    @PostMapping("/checkout/{companionId}")
    public ResponseEntity<CheckoutResponse> checkout(
            @PathVariable UUID companionId,
            @RequestBody CheckoutRequest request) {

        PaymentOrder order = paymentService.createCheckout(companionId, request.planId());
        return ResponseEntity.ok(new CheckoutResponse(order.getId(), order.getCheckoutUrl()));
    }

    // webhook fictício
    @PostMapping("/webhook/mock-approve/{gatewayReference}")
    public ResponseEntity<Void> mockApproveWebhook(@PathVariable String gatewayReference) {
        paymentService.processWebhookApproval(gatewayReference);
        return ResponseEntity.ok().build();
    }
}