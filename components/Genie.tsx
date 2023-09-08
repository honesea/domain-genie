"use client";

import { useState } from "react";
import ReactCSSTransitionGroup from "react-transition-group";

export default function Genie() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState<string[]>([]);

  async function getDomains() {
    setLoading(true);

    const response = await fetch("/api/genie", {
      method: "POST",
      body: JSON.stringify({ description }),
    });

    if (response.body) {
      const reader = response.body.getReader();

      try {
        setDomains([]);
        let domainString = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            const newDomains = domainString.split(",");
            setDomains((domains) => [...domains, ...newDomains]);
            break;
          }

          // Process the chunk of data
          const chunk = new TextDecoder().decode(value);
          domainString += chunk;

          // Parse the string into an array of domains
          const newDomains = domainString.split(",");
          const partialDomain = newDomains.pop();
          setDomains((domains) => [...domains, ...newDomains]);

          // Reset domain string as new domains have already been processed
          domainString = partialDomain || "";
        }
      } catch (error) {
        console.error(`Error processing response: ${error}`);
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <section className="flex w-full max-w-screen-sm flex-col gap-2">
        <label>Describe your website:</label>
        <textarea
          className="resize-none rounded border border-neutral-300 p-3"
          rows={4}
          maxLength={150}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="An e-commerce store for selling shoes"
        />
        <span className="text-right text-neutral-400">
          {description.length} / 150
        </span>
        <button
          className={`w-full rounded px-2 py-3 text-lg transition-colors ${
            loading
              ? "pointer-events-none bg-amber-100 text-neutral-600"
              : "bg-amber-400 text-white"
          }`}
          onClick={getDomains}
        >
          {loading ? "Loading..." : "Genie Time!"}
        </button>
      </section>

      <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain, index) => (
          <div
            key={index}
            className="w-full rounded border px-2 py-3 text-center text-2xl"
          >
            <span>{domain.toLowerCase()}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
