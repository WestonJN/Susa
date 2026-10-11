export interface Area {
  slug: string;
  name: string;
  /** Unique, useful copy per area (access realities, typical building types). */
  intro: string;
  accessNotes: readonly string[];
  nearby: readonly string[];
}

export const areas: readonly Area[] = [
  {
    slug: "johannesburg",
    name: "Johannesburg",
    intro:
      "From inner-city apartment blocks to suburban family homes, Johannesburg moves are rarely identical. Distances between suburbs can be short on the map and long in traffic, so we price by route and time window rather than a one-size flat rate.",
    accessNotes: [
      "Many sectional-title buildings need a move-in booking, a lift reservation or a refundable deposit with the body corporate.",
      "Security estates and boom gates often limit truck size and hours. Tell us the estate name in your quote request.",
      "Early-morning slots usually avoid the heaviest traffic on the main arterials.",
    ],
    nearby: ["Rosebank", "Fourways", "Randburg", "Roodepoort", "Bryanston", "Melville"],
  },
  {
    slug: "pretoria",
    name: "Pretoria",
    intro:
      "Whether you are moving between Pretoria East suburbs, into a student flat near the universities or across to Johannesburg, we match the truck to the load so you only pay for what you need.",
    accessNotes: [
      "Older suburbs can have narrow streets and low branches. A smaller truck and a second trip is sometimes the safer choice.",
      "Student and flat moves are often a good fit for a bakkie or a 1.5 ton truck.",
      "Pretoria to Johannesburg runs use the N1 and can include toll costs, which we show in your quote.",
    ],
    nearby: ["Centurion", "Brooklyn", "Menlyn", "Hatfield", "Waterkloof", "Montana"],
  },
  {
    slug: "sandton",
    intro:
      "Sandton is full of apartments, townhouse complexes and gated estates, so access rules matter as much as distance. Booking the lift and confirming move-in hours early is the difference between a smooth day and a delayed one.",
    name: "Sandton",
    accessNotes: [
      "High-rise buildings usually restrict moves to set hours and require lift padding.",
      "Parking and loading-bay height limits can rule out a tall 8 ton truck. Mention them when you request a quote.",
      "Add the number of floors in the quote form so the crew estimate is realistic.",
    ],
    nearby: ["Morningside", "Bryanston", "Rivonia", "Sunninghill", "Illovo", "Hyde Park"],
  },
  {
    slug: "centurion",
    name: "Centurion",
    intro:
      "Centurion sits between Johannesburg and Pretoria, which makes it a common start or end point for moves in both directions. Many homes are in estates with their own contractor rules, so we ask about them up front.",
    accessNotes: [
      "Estates commonly require contractor registration or a move-in form before the truck can enter.",
      "Highway distance to Johannesburg and Pretoria is included in the route-based price.",
      "Complexes with shared driveways may limit how long a truck can be parked.",
    ],
    nearby: ["Irene", "Midstream", "Lyttelton", "Eldoraigne", "Clubview", "Wierda Park"],
  },
  {
    slug: "midrand",
    name: "Midrand",
    intro:
      "Midrand mixes new residential developments with business parks, so we handle both home moves and small office relocations. Tell us whether it is a house, flat or office and we will size the truck and crew accordingly.",
    accessNotes: [
      "Business parks usually have loading-bay hours and may need a contractor access letter.",
      "New developments can have unfinished roads. Share the exact address so we can plan access.",
      "Office moves often suit an evening or weekend slot.",
    ],
    nearby: ["Waterfall", "Kyalami", "Halfway House", "Noordwyk", "Vorna Valley", "Carlswald"],
  },
] as const;
