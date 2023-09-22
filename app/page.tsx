import Image from "next/image";
import Genie from "@/components/Genie";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-12 px-6 py-12">
      <section>
        <div className="flex justify-center">
          <Image
            src="/domain-genie.png"
            width={250}
            height={250}
            alt="Picture of the domain genie"
          />
        </div>

        <h1 className="text-center text-4xl font-bold">Domain Genie</h1>
        <h2 className="text-center text-xl font-light text-amber-400">
          AI-powered domain name generator
        </h2>
      </section>

      <Genie />
    </main>
  );
}
