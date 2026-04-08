package com.sensara.api.domain.payment.gateway;

import com.sensara.api.domain.payment.model.PaymentOrder;

public interface PaymentGateway {
    // Retorna a url de pagamento ou código pix
    String generateCheckout(PaymentOrder order);
}