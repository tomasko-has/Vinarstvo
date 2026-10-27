// Základné údaje o vinárstve. Placeholdery ({OBEC}, telefón) doplní používateľ.
export const site = {
  name: "Vinárstvo Na Spraši",
  shortName: "Na Spraši",
  tagline: "Víno, ktoré pozná svoju pôdu.",
  lane: "Sprašová ulička",
  laneIn: "v Sprašovej uličke",
  address: {
    street: "Sprašová ulička 7",
    city: "{OBEC}",
    zip: "000 00",
    region: "Južnoslovenská vinohradnícka oblasť",
  },
  phone: "+421 900 000 000",
  email: "pivnica@na-sprasi.sk",
  url: "https://na-sprasi.sk",
  social: {
    facebook: "#",
    instagram: "#",
  },
} as const;

export const currency = "EUR";
