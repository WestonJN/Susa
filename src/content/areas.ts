export interface Area {
  slug: string;
  name: string;
  /** Unique, useful copy per area (access realities, typical building types). */
  intro: string;
  accessNotes: readonly string[];
  nearby: readonly string[];
}

/** We currently operate in the City of Johannesburg only. Add an entry here when a new area opens. */
export const areas: readonly Area[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    intro:
      "We currently move homes and offices across the City of Johannesburg only, from inner-city apartment blocks to suburban family homes and estates. Distances between suburbs can be short on the map and long in traffic, so we price by route and time window rather than a one-size flat rate.",
    accessNotes: [
      "Many sectional-title buildings need a move-in booking, a lift reservation or a refundable deposit with the body corporate. Sort this out a few days before your move.",
      "Security estates and boom gates often limit truck size and hours. Tell us the estate name in your quote request.",
      "Early-morning slots usually avoid the heaviest traffic on the main arterials.",
      "Our smaller vehicles suit tight complexes and older suburbs with narrow streets, and a second trip is sometimes safer than one big truck.",
    ],
    nearby: [
      "Sandton",
      "Rosebank",
      "Fourways",
      "Randburg",
      "Bryanston",
      "Melville",
      "Roodepoort",
      "Midrand",
      "Parktown",
      "Soweto",
      "Johannesburg CBD",
    ],
  },
] as const;
