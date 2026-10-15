export interface Area {
  slug: string;
  name: string;
  /** Unique, useful copy per area. Access notes are general tips, not claims about the business. */
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
      "We currently move homes, flats and small offices within the City of Johannesburg only. That includes inner-city apartment blocks, suburban family homes and security estates. Suburbs can be close on the map and slow to reach in traffic, so your estimate is built from the driving distance and the crew time.",
    accessNotes: [
      "Sectional-title complexes often need a move-in booking, a lift reservation or a refundable deposit paid to the body corporate or managing agent. Ask them a few days before your move.",
      "Estates and complexes with boom gates usually need access cards, a visitor list or a gate pass for the vehicle and crew. Some limit vehicle size or moving hours, so ask the security office or estate manager early. Mention the estate name and any size limit when you send your request.",
      "Load-shedding can stop lifts and gate motors. Check the schedule for your move day and ask whether the building's lift has backup power.",
      "Kerb space is limited in busy areas such as the CBD, Rosebank and Sandton. Ask the building where a vehicle may stop to load.",
      "The N1, M1 and other main routes are busiest on weekday mornings and late afternoons. An early start or a weekend slot usually makes for an easier day.",
      "We move with one 1.3 ton bakkie, on its own or with a closed trailer. A bakkie is easier to get into tight complexes and narrow streets than a large truck. If you are worried about a low gate or a steep driveway, say so when you send your request.",
      "Without a lift, every floor the crew carries adds time. Enter the number of floors in the quote form and it shows as a line in your estimate.",
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
