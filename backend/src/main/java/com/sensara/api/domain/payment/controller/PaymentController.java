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

    // Rota que o frontend chama quando a acompanhante clica em "Comprar plano"
    @PostMapping("/checkout/{companionId}")
    public ResponseEntity<CheckoutResponse> checkout(
            @PathVariable UUID companionId,
            @RequestBody CheckoutRequest request) {

        PaymentOrder order = paymentService.createCheckout(companionId, request.planId());
        return ResponseEntity.ok(new CheckoutResponse(order.getId(), order.getCheckoutUrl()));
    }

    // Rota webhook (fictícia para você testar a aprovação)
    // No frontend, você pode criar um botão oculto "Forçar Pagamento" que chama
    // essa rota
    // passando a referencia gerada, só para ver a assinatura ativando no banco.
    @PostMapping("/webhook/mock-approve/{gatewayReference}")
    public ResponseEntity<Void> mockApproveWebhook(@PathVariable String gatewayReference) {
        paymentService.processWebhookApproval(gatewayReference);
        return ResponseEntity.ok().build();
    }
}