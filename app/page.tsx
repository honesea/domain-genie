import Genie from "@/components/Genie";

export default function Home() {
  return (
    <main className="flex flex-col gap-12 px-6 py-24">
      <section>
        <h1 className="text-center text-4xl font-bold">Domain Genie</h1>
        <h2 className="text-center text-xl">
          AI-powered domain name generator
        </h2>
      </section>

      <Genie />
    </main>
  );
}
