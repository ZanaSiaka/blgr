import { expect, test } from "@playwright/test";

test("redirige vers /login quand non authentifié", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL("**/login");
  expect(page.url()).toContain("/login");
});

test("affiche le formulaire de connexion", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Nom d'utilisateur")).toBeVisible();
  await expect(page.getByLabel("Mot de passe")).toBeVisible();
  await expect(page.getByRole("button", { name: /Se connecter/i })).toBeVisible();
});