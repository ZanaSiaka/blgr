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
});

export const receiveLinesSchema = z
  .object({
    lines: z.array(receiveLineSchema).min(1, "Au moins une ligne"),
  })
  .strict();

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