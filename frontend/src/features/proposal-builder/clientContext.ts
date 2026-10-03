import type { ClientId } from "./types";

export type ClientContext = {
  id: ClientId;
  name: string;
  role: string;
  company: string;
  businessProblem: string;
  priorities: string[];
};

export const clientContexts: Record<ClientId, ClientContext> = {
  sarah: {
    id: "sarah",
    name: "Sarah Chen",
    role: "Chief Operating Officer",
    company: "ACMD Manufacturing",
    businessProblem:
      "Supply-chain visibility issues, delays, and disconnected operational data.",
    priorities: [
      "Improve operational visibility",
      "Reduce delays",
      "Avoid major business disruption",
    ],
  },

  david: {
    id: "david",
    name: "David Palte",
    role: "Chief Technology Officer",
    company: "Meridian Retail Group",
    businessProblem:
      "Fragmented customer data across systems and concerns about oversized consulting engagements.",
    priorities: [
      "Improve customer data integration",
      "Keep the engagement focused",
      "Avoid unnecessary consulting scope",
    ],
  },
};

export function getClientContext(clientId: ClientId): ClientContext {
  return clientContexts[clientId];
}