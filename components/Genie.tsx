"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import Spinner from "./Spinner";

type DomainStatus = "LOADING" | "AVAILABLE" | "UNAVAILABLE";

const Domain = ({
  domain,
  status,
}: {
  domain: string;
  status: DomainStatus;
}) => (
  <div className="flex w-full flex-col gap-1 rounded border px-2 py-3 text-center text-2xl">
    <span>{domain}</span>
    <div className="flex items-center justify-center gap-1">
      {status === "LOADING" ? (
        <ArrowPathIcon className="h-3 w-3 animate-spin text-neutral-400" />
      ) : status === "AVAILABLE" ? (
        <CheckCircleIcon className="h-4 w-4 text-green-500" />
      ) : (
        <XCircleIcon className="h-4 w-4 text-red-500" />
      )}
      <span className="text-xs text-neutral-400">
        {status === "LOADING"
          ? "Checking"
          : status === "AVAILABLE"
          ? "Available"
          : "Unavailable"}
      </span>
    </div>
  </div>
);

export default function Genie() {
  const domainDescriptionTextarea = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [domainStatuses, setDomainStatuses] = useState<
    Map<string, DomainStatus>
  >(new Map());

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
    setDomainStatuses(new Map());

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
          const cleanedDomains = newDomains.map((domain) =>
            domain.trim().toLowerCase(),
          );
          setDomains((domains) => [...domains, ...cleanedDomains]);

          for (const domain of cleanedDomains) {
            validateDomain(domain);
          }

          break;
        }

        // Process the chunk of data
        const chunk = new TextDecoder().decode(value);
        domainString += chunk;

        // Parse the string into an array of domains
        const newDomains = domainString.split(",");
        const partialDomain = newDomains.pop();
        const cleanedDomains = newDomains.map((domain) =>
          domain.trim().toLowerCase(),
        );
        setDomains((domains) => [...domains, ...cleanedDomains]);

        for (const domain of cleanedDomains) {
          validateDomain(domain);
        }

        // Reset domain string as new domains have already been processed
        domainString = partialDomain || "";
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function validateDomain(domain: string) {
    setDomainStatuses((prevStatuses) =>
      new Map(prevStatuses).set(domain, "LOADING"),
    );

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw error;
      }

      const result = await response.json();
      setDomainStatuses((prevStatuses) =>
        new Map(prevStatuses).set(domain, result.domain_status),
      );
    } catch (error: any) {
      toast.error(error);
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
          className={`h-14 w-full rounded px-2 py-3 text-lg transition-all ${
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
          {domains.map((domain) => (
            <CSSTransition key={domain} timeout={500} classNames="domain-anim">
              <Domain
                domain={domain}
                status={domainStatuses.get(domain) || "LOADING"}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </section>
    </div>
  );
}
