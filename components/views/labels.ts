"use client";

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrateur",
  RESP_DEPOT: "Responsable Dépôt",
  RESP_BOUTIQUE: "Responsable Boutique",
  BOULANGER: "Boulanger",
  VENDEUR: "Vendeur",
};

export const TYPE_LABEL: Record<string, string> = {
  RAW_MATERIAL: "Matière première",
  CONSUMABLE: "Consommable",
  FINISHED_GOOD: "Produit fini",
  RESALE_GOOD: "Acheté en l'état",
};

export const KIND_LABEL: Record<string, string> = {
  DEPOT: "Dépôt",
  BOUTIQUE: "Boutique",
};