package com.sensara.api.domain.companion.specification;

import com.sensara.api.domain.companion.model.Companion;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;

public class CompanionSpecification {

    // Adicione este construtor privado para resolver o aviso do SonarLint
    private CompanionSpecification() {
    }

    public static Specification<Companion> filter(
            String state, String city, Integer minAge, Integer maxAge,
            BigDecimal maxPrice, String ethnicity) {

        return (root, query, cb) -> {
            var predicates = new ArrayList<Predicate>();

            if (state != null)
                predicates.add(cb.equal(root.get("state"), state));
            if (city != null)
                predicates.add(cb.equal(root.get("city"), city));
            if (minAge != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("age"), minAge));
            if (maxAge != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("age"), maxAge));
            if (maxPrice != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            if (ethnicity != null)
                predicates.add(cb.equal(root.get("ethnicity"), ethnicity));

            predicates.add(cb.isTrue(root.get("verified")));

            query.orderBy(cb.desc(root.get("profileViews")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}