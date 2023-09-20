"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Spinner from "./Spinner";

export default function Genie() {
  const domainDescriptionTextarea = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState<string[]>([]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      domainDescriptionTextarea?.current?.blur();

      if (!!description) {
        getDomains();
      }
    }
  };

  async function getDomains() {
    setLoading(true);
    setDomains([]);

    try {
      const response = await fetch("/api/genie", {
        method: "POST",
        body: JSON.stringify({ description }),
      });

      if (!response.ok || !response.body) {
        const { error } = await response.json();
        throw error;
      }

      const reader = response.body.getReader();

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
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <section className="flex w-full max-w-screen-sm flex-col gap-2">
        <label className="text-sm">Describe your website:</label>
        <textarea
          ref={domainDescriptionTextarea}
          className="resize-none rounded border border-neutral-300 p-3 outline-amber-400"
          rows={4}
          maxLength={150}
          onKeyDown={handleKeyDown}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="An e-commerce store for selling shoes"
        />
        <span className="text-right text-sm text-neutral-400">
          {description.length} / 150
        </span>
        <button
          className={`w-full rounded px-2 py-3 text-lg transition-all ${
            loading || !description
              ? "pointer-events-none bg-amber-100 text-neutral-600"
              : "bg-amber-400 text-white"
          }`}
          disabled={loading || !description}
          onClick={getDomains}
        >
          {loading ? <Spinner /> : <span>Genie Time!</span>}
        </button>
      </section>

      <section className="w-full">
        <TransitionGroup className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain, index) => (
            <CSSTransition key={index} timeout={500} classNames="domain-anim">
              <div className="w-full rounded border px-2 py-3 text-center text-2xl">
                <span>{domain.toLowerCase()}</span>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </section>
    </div>
  );
}
