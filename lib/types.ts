export type Role = "ADMIN" | "RESP_DEPOT" | "RESP_BOUTIQUE" | "BOULANGER" | "VENDEUR";
export type SiteKind = "DEPOT" | "BOUTIQUE";
export type ArticleType = "RAW_MATERIAL" | "CONSUMABLE" | "FINISHED_GOOD" | "RESALE_GOOD";
export type POStatus = "EN_ATTENTE" | "LIVRE" | "ECART";
export type TransferStatus = "OPEN" | "RECEIVED" | "DISCREPANCY" | "CANCELLED";
export type EcartReason = "CASSE" | "MANQUANT" | "ERREUR_SAISIE" | "AUTRE";
export type Shift = "MATIN" | "APRES_MIDI";
export type SaleStatus = "PAID" | "VOID";
export type ClosureStatus = "OPEN" | "CLOSED";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD";
export type AdjustmentReason = "INVENTORY" | "LOSS" | "DAMAGE" | "EXPIRED" | "PROMOTION";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown[];
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  site_id: number | null;
  is_active: boolean;
}

export interface Site {
  id: number;
  code: string;
  name: string;
  kind: SiteKind;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
}

export interface Article {
  id: number;
  code: string;
  name: string;
  category: Category;
  unit: Unit;
  type: ArticleType;
  for_sale: boolean;
  cost_price: number | null;
  sale_price: number | null;
  min_stock: number;
  perishable: boolean;
  is_active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
}

export interface PurchaseLine {
  id: number;
  article_id: number;
  article_name: string;
  ordered_qty: number;
  received_qty: number;
  unit_price: number;
}

export interface PurchaseOrder {
  id: number;
  ref: string;
  supplier_id: number;
  supplier: string;
  site_id: number;
  order_date: string;
  status: POStatus;
  paid: boolean;
  amount_ordered: number;
  amount_received: number;
  notes: string | null;
  created_at: string;
  validated_at: string | null;
  lines: PurchaseLine[];
}

export interface StockItem {
  site_id: number;
  article_id: number;
  article_code: string;
  article_name: string;
  category: string;
  unit: string;
  qty: number;
  min_stock: number;
  cost_value: number;
}

export interface Movement {
  id: number;
  site_id: number;
  article_id: number;
  article_name: string;
  qty_delta: number;
  reason: string;
  ref_doc: string | null;
  note: string | null;
  created_at: string;
}

export interface Lot {
  id: number;
  article_id: number;
  article_name: string;
  site_id: number;
  lot_number: string | null;
  expiry_date: string | null;
  initial_qty: number;
  remaining_qty: number;
  is_active: boolean;
}

export interface TransferLine {
  id: number;
  article_id: number;
  article_name: string;
  qty_sent: number;
  qty_received: number | null;
  ecart_reason: EcartReason | null;
  ecart_note: string | null;
}

export interface TransferNote {
  id: number;
  ref: string;
  from_site_id: number;
  to_site_id: number;
  status: TransferStatus;
  created_at: string;
  received_at: string | null;
  notes: string | null;
  parent_note_id: number | null;
  lines: TransferLine[];
}

export interface RecipeLine {
  id: number;
  material_article_id: number;
  material_name: string;
  qty_per_unit: number;
  cost_price: number | null;
  line_cost: number;
}

export interface Recipe {
  id: number;
  name: string;
  article_id: number;
  article_name: string;
  article_sale_price: number | null;
  unit_cost: number;
  is_active: boolean;
  notes: string | null;
  lines: RecipeLine[];
}

export interface ProductionOrder {
  id: number;
  ref: string;
  site_id: number;
  recipe_id: number;
  recipe_name: string;
  conforming_qty: number;
  loss_qty: number;
  notes: string | null;
  created_at: string;
}

export interface PosProduct {
  article_id: number;
  article_code: string;
  name: string;
  category: string;
  sale_price: number;
  qty_available: number;
}

export interface SaleLine {
  id: number;
  article_id: number;
  article_name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface SalePayment {
  id: number;
  method: PaymentMethod;
  amount: number;
}

export interface SaleTicket {
  id: number;
  ref: string;
  site_id: number;
  sale_date: string;
  seq: number;
  status: SaleStatus;
  total_amount: number;
  created_at: string;
  lines: SaleLine[];
  payments: SalePayment[];
}

export interface Closure {
  id: number;
  site_id: number;
  cashier_id: number;
  status: ClosureStatus;
  opened_at: string;
  closed_at: string | null;
  expected_cash: number;
  expected_mobile: number;
  expected_card: number;
  counted_cash: number | null;
  counted_mobile: number | null;
  counted_card: number | null;
  over_short: number;
}

export interface Treasury {
  site_id: number;
  balance: number;
}

export interface TreasuryMovement {
  id: number;
  site_id: number;
  amount_delta: number;
  reason: string;
  ref_doc: string | null;
  note: string | null;
  created_at: string;
}

export interface DashboardData {
  ca_today: number;
  nb_boutiques: number;
  ventes_par_boutique: Record<string, number>;
  transferts_en_transit: number;
  nb_sites: number;
  depenses_jour: number;
  net_jour: number;
  activites_recentes: Array<{
    id: number;
    article: string;
    delta: number;
    reason: string;
    ref: string | null;
    created_at: string | null;
  }>;
}

export interface Expense {
  id: number;
  site_id: number;
  site_name: string;
  category_id: number;
  category_name: string;
  expense_date: string;
  label: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface ExpenseReportRow {
  date: string;
  site_id: number;
  site_name: string;
  total: number;
  count: number;
}

export interface Alert {
  kind: "SEUIL" | "DLC";
  article_id: number;
  article_name: string;
  site_id: number;
  site_name: string;
  message: string;
}

export interface SalesReportRow {
  date: string;
  site_id: number;
  total: number;
}

export interface TopProductRow {
  article_id: number;
  name: string;
  qty: number;
  revenue: number;
}

export interface MarginRow {
  article_id: number;
  name: string;
  qty: number;
  revenue: number;
  cost: number;
  margin: number;
}

// Réceptions (admin)
export interface ReceptionLine {
  article_name: string;
  expected_qty: number;
  received_qty: number;
  diff: number;
  reason: string | null;
  note: string | null;
}

export interface ReceptionRow {
  kind: "ACHAT" | "TRANSFERT";
  ref: string;
  date: string | null;
  site_id: number;
  site_name: string;
  counterpart: string;
  status: string;
  total_ecarts: number;
  lines: ReceptionLine[];
}

// Journal quotidien -------------------------------------------------
export interface DailyProductionLine {
  id: number;
  recipe_id: number | null;
  shift: Shift;
  position: number;
  quantity: number;
  pu: number;
  kg: number;
}

export interface DailyRafraichissementLine {
  id: number;
  article_id: number | null;
  designation: string;
  stock_initial: number;
  arrivage: number;
  vendus: number;
  pu: number;
}

export interface DailyPatisserieLine {
  id: number;
  article_id: number | null;
  designation: string;
  report: number;
  produit: number;
  vendus: number;
  pu: number;
  reste: number;
  racis: number;
}

export interface DailyStockMatiere {
  id: number;
  designation: string;
  stock_initial: number;
  arrivage: number;
  sortie: number;
  utilise: number;
  total?: number;
  stock_final?: number;
}

export interface DailyClientSpecial {
  id: number;
  designation: string;
  quantity: number;
  unit_price: number;
  total: number;
  amount_due: number;
  amount_paid: number;
  amount_to_pay: number;
}

export interface DailyDepense {
  id: number;
  designation: string;
  montant: number;
}

export interface DailyJournalData {
  id: number | null;
  site_id: number;
  journal_date: string;
  boulanger_names: string | null;
  cashier_name: string | null;
  cashier_phone: string | null;
  personnel: string | null;
  observations: string | null;
  montant_verse: number;
  bank_name: string | null;
  bank_ref: string | null;
  wave_amount: number;
  orange_amount: number;
  invendus_casse: number;
  invendus_brule: number;
  invendus_rasse: number;
  invendus_ration: number;
  glace_arrivage_pack: number;
  glace_arrivage_cornet: number;
  glace_vendus: number;
  glace_pu: number;
  glace_prix_vente: number;
  productions: DailyProductionLine[];
  rafraichissements: DailyRafraichissementLine[];
  patisseries: DailyPatisserieLine[];
  stock_matieres: DailyStockMatiere[];
  clients_speciaux: DailyClientSpecial[];
  depenses: DailyDepense[];
  glacier_lines: GlacierLine[];
  recette_client_special: number;
  recette_pain: number;
  recette_patisseries: number;
  recette_frigo: number;
  recette_glacier: number;
  total_glaces: number;
  montant_restant_glace: number;
  total_recette: number;
  total_depenses: number;
  solde: number;
  manquant: number;
  total_production: number;
  baguette_total: number;
  vendues: number;
  total_patisserie: number;
}

export interface GlacierLine {
  id: number;
  category: GlacierCategory;
  designation: string;
  stock_initial: number;
  arrivage: number;
  vendus: number;
  pu: number;
}

export type GlacierCategory = "RAFRAICHISSEMENT" | "RESTAURANT";

export interface IngredientMapEntry {
  role: "FARINE" | "LEVURE" | "AMELIORANT" | "SEL";
  article_id: number;
  article_name: string;
}