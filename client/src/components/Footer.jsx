export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">
        <p>
          SarkariSetu is an independent aggregator for Indian government job and scheme listings.
          Always verify eligibility and deadlines on the official website before applying.
        </p>
        <p className="mt-2">&copy; {new Date().getFullYear()} SarkariSetu. Not affiliated with the Government of India.</p>
      </div>
    </footer>
  );
}
