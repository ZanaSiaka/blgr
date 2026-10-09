import JournalPage from "@/components/journal-page";

export default function Page(props: { searchParams: Promise<{ site_id?: string; date?: string }> }) {
  return <JournalPage section="recap" {...props} basePath="/rapports/journeau" siteLabel="Dépôt" readOnly />;
}
