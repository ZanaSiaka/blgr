import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(3, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const transferLineSchema = z.object({
  article_id: z.coerce.number().int().positive(),
  qty_sent: z.coerce.number().int().positive(),
});

export const transferCreateSchema = z.object({
  to_site_id: z.coerce.number().int().positive(),
  lines: z.array(transferLineSchema).min(1, "Au moins une ligne"),
});

export const receiveLineSchema = z.object({
  article_id: z.coerce.number().int().positive(),
  received_qty: z.coerce.number().int().min(0),
  ecart_reason: z.enum(["CASSE", "MANQUANT", "ERREUR_SAISIE", "AUTRE"]).optional(),
  ecart_note: z.string().max(300).optional(),
});

export const receiveLinesSchema = z
  .object({
    lines: z.array(receiveLineSchema).min(1, "Au moins une ligne"),
  })
  .strict();

export const returnSchema = z
  .object({
    lines: z
      .array(
        z.object({
          article_id: z.coerce.number().int().positive(),
          qty_to_return: z.coerce.number().int().positive(),
        }),
      )
      .min(1, "Au moins une ligne"),
    reason: z.enum(["CASSE", "MANQUANT", "ERREUR_SAISIE", "AUTRE"]).default("AUTRE"),
  })
  .strict();

export const dailyProductionLineSchema = z.object({
  shift: z.enum(["MATIN", "APRES_MIDI"]).default("MATIN"),
  position: z.coerce.number().int().min(0).default(0),
  kg: z.coerce.number().min(0).default(0),
  nbre_pate: z.coerce.number().int().min(0).default(0),
  double: z.coerce.number().int().min(0).default(0),
  baguette: z.coerce.number().int().min(0).default(0),
  nd: z.coerce.number().int().min(0).default(0),
  ficelle: z.coerce.number().int().min(0).default(0),
  levure: z.coerce.number().min(0).default(0),
  ameliorant: z.coerce.number().min(0).default(0),
  sel: z.coerce.number().min(0).default(0),
  baker_name: z.string().max(120).nullable().optional(),
});

export const dailySheetSchema = z
  .object({
    cashier_name: z.string().max(120).nullable().optional(),
    manager_name: z.string().max(120).nullable().optional(),
    personnel: z.string().max(1000).nullable().optional(),
    montant_verse: z.coerce.number().int().min(0).default(0),
    bank_name: z.string().max(80).nullable().optional(),
    bank_ref: z.string().max(80).nullable().optional(),
    gas_bottle_level: z.string().max(40).nullable().optional(),
    unsold_broken: z.coerce.number().int().min(0).default(0),
    unsold_stale: z.coerce.number().int().min(0).default(0),
    unsold_ration: z.coerce.number().int().min(0).default(0),
    unsold_other: z.coerce.number().int().min(0).default(0),
    notes: z.string().max(1000).nullable().optional(),
    production: z.array(dailyProductionLineSchema).default([]),
    special_clients: z
      .array(
        z.object({
          client_name: z.string().min(1).max(120),
          quantity: z.coerce.number().int().min(0).default(0),
          unit_price: z.coerce.number().int().min(0).default(0),
          amount_due: z.coerce.number().int().min(0).default(0),
          amount_paid: z.coerce.number().int().min(0).default(0),
          amount_to_pay: z.coerce.number().int().min(0).default(0),
        }),
      )
      .default([]),
    materials: z
      .array(
        z.object({
          article_id: z.coerce.number().int().positive().nullable().optional(),
          designation: z.string().min(1).max(120),
          stock_initial: z.coerce.number().int().min(0).default(0),
          arrivage: z.coerce.number().int().min(0).default(0),
          sortie: z.coerce.number().int().min(0).default(0),
          utilise: z.coerce.number().int().min(0).default(0),
          stock_k: z.coerce.number().int().min(0).default(0),
          stock_final_sac: z.coerce.number().int().min(0).default(0),
        }),
      )
      .default([]),
  })
  .strict();

export const ingredientMapSchema = z
  .array(
    z.object({
      role: z.enum(["FARINE", "LEVURE", "AMELIORANT", "SEL"]),
      article_id: z.coerce.number().int().positive(),
    }),
  )
  .max(4);

export const productionSchema = z.object({
  recipe_id: z.coerce.number().int().positive(),
  conforming_qty: z.coerce.number().int().min(0),
  loss_qty: z.coerce.number().int().min(0),
});

export const paymentMethodSchema = z.enum(["CASH", "MOBILE_MONEY", "CARD"]);

export const saleSchema = z
  .object({
    site_id: z.coerce.number().int().positive(),
    items: z
      .array(
        z.object({
          article_id: z.coerce.number().int().positive(),
          qty: z.coerce.number().int().positive(),
        }),
      )
      .min(1, "Panier vide"),
    payments: z
      .array(
        z.object({
          method: paymentMethodSchema,
          amount: z.coerce.number().int().min(0),
        }),
      )
      .min(1, "Aucun moyen de paiement"),
  })
  .strict();

export const purchaseOrderSchema = z
  .object({
      supplier_id: z.coerce.number().int().positive(),
    lines: z
      .array(
        z.object({
          article_id: z.coerce.number().int().positive(),
          ordered_qty: z.coerce.number().int().positive(),
          unit_price: z.coerce.number().int().min(0),
        }),
      )
      .min(1, "Au moins une ligne"),
  })
  .strict();

export const adjustmentSchema = z.object({
  article_id: z.coerce.number().int().positive(),
  qty: z.coerce.number().int(),
  reason: z.enum(["INVENTORY", "LOSS", "DAMAGE", "EXPIRED", "PROMOTION"]),
  note: z.string().max(300).optional(),
});

export const recipeCreateSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  article_id: z.coerce.number().int().positive(),
  lines: z
    .array(
      z.object({
        material_article_id: z.coerce.number().int().positive(),
        qty_per_unit: z.coerce.number().positive(),
      }),
    )
    .min(1, "Au moins un composant"),
});

export const closureCloseSchema = z.object({
  counted_cash: z.coerce.number().int().min(0),
  counted_mobile: z.coerce.number().int().min(0),
  counted_card: z.coerce.number().int().min(0),
});

export const expenseCreateSchema = z
  .object({
    category_id: z.coerce.number().int().positive(),
    expense_date: z.string().optional(),
    label: z.string().min(1, "Libellé requis").max(160),
    amount: z.coerce.number().int().positive(),
    note: z.string().max(300).optional(),
  })
  .strict();

// Administration -----------------------------------------------------
export const roleSchema = z.enum(["ADMIN", "RESP_DEPOT", "RESP_BOUTIQUE", "BOULANGER", "VENDEUR"]);
export const siteKindSchema = z.enum(["DEPOT", "BOUTIQUE"]);
export const articleTypeSchema = z.enum(["RAW_MATERIAL", "CONSUMABLE", "FINISHED_GOOD", "RESALE_GOOD"]);

export const userCreateSchema = z
  .object({
    username: z.string().min(3, "Nom d'utilisateur requis").max(60),
    password: z.string().min(8, "Mot de passe : 8 caractères minimum"),
    full_name: z.string().min(1, "Nom complet requis").max(120),
    role: roleSchema,
    site_id: z.coerce.number().int().positive().nullable().optional(),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    full_name: z.string().min(1).max(120).optional(),
    role: roleSchema.optional(),
    site_id: z.coerce.number().int().positive().nullable().optional(),
    is_active: z.boolean().optional(),
    password: z.string().min(8).optional(),
  })
  .strict();

export const siteCreateSchema = z
  .object({
    code: z.string().min(1).max(40),
    name: z.string().min(1).max(120),
    kind: siteKindSchema,
  })
  .strict();

export const siteUpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    kind: siteKindSchema.optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export const supplierCreateSchema = z
  .object({
    name: z.string().min(1).max(120),
    contact_name: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().max(120).optional(),
    address: z.string().max(300).optional(),
  })
  .strict();

export const supplierUpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    contact_name: z.string().max(120).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    email: z.string().max(120).nullable().optional(),
    address: z.string().max(300).nullable().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export const articleCreateSchema = z
  .object({
    name: z.string().min(1).max(120),
    category_id: z.coerce.number().int().positive(),
    unit_id: z.coerce.number().int().positive(),
    type: articleTypeSchema,
    for_sale: z.boolean().default(false),
    cost_price: z.coerce.number().int().min(0).nullable().optional(),
    sale_price: z.coerce.number().int().min(0).nullable().optional(),
    min_stock: z.coerce.number().int().min(0).default(0),
    perishable: z.boolean().default(false),
  })
  .strict();

export const articleUpdateSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    category_id: z.coerce.number().int().positive().optional(),
    unit_id: z.coerce.number().int().positive().optional(),
    type: articleTypeSchema.optional(),
    for_sale: z.boolean().optional(),
    cost_price: z.coerce.number().int().min(0).nullable().optional(),
    sale_price: z.coerce.number().int().min(0).nullable().optional(),
    min_stock: z.coerce.number().int().min(0).optional(),
    perishable: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(300).nullable().optional(),
});

export const unitCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(40),
});

export const unitUpdateSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(40).optional(),
});

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown[] } };

export type Failure = {
  ok: false;
  error: { code: string; message: string; details?: unknown[] };
};

export function validationError(err: z.ZodError): Failure {
  const first = err.issues[0];
  return {
    ok: false,
    error: {
      code: "VALIDATION",
      message: first ? first.message : "Données invalides",
      details: err.issues,
    },
  };
}