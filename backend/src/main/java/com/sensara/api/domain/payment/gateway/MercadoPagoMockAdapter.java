package com.sensara.api.domain.payment.gateway;

import com.sensara.api.domain.payment.model.PaymentOrder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MercadoPagoMockAdapter implements PaymentGateway {

    @Override
    public String generateCheckout(PaymentOrder order) {
        // No futuro, aqui vai o código do SDK do mercado pago.
        // Por enquanto, fingimos que gerou um link de pagamento.
        String fakeTransactionId = "MP-" + UUID.randomUUID().toString().substring(0, 8);
        order.setGatewayReference(fakeTransactionId);

        return "https://sandbox.mercadopago.com.br/checkout/fake-url-" + fakeTransactionId;
    }
}