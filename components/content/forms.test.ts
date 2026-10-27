import { describe, expect, it } from "vitest";
import { validateEnquiry } from "./forms";

describe("validateEnquiry", () => {
  it("kontakt: prázdny formulár hlási povinné polia", () => {
    const errors = validateEnquiry("kontakt", {});
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });

  it("kontakt: platné hodnoty prejdú", () => {
    expect(
      validateEnquiry("kontakt", { name: "Jana Nováková", email: "jana@example.sk", message: "Dobrý deň" }),
    ).toEqual({});
  });

  it("odmietne neúplný e-mail a zlý telefón", () => {
    const errors = validateEnquiry("kontakt", { name: "Jana", email: "jana@", phone: "abc", message: "x" });
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  it("degustácia: kontroluje počet osôb", () => {
    const base = { name: "Peter", email: "p@e.sk", tasting: "ulicka", date: "2027-01-10" };
    expect(validateEnquiry("degustacia", { ...base, guests: "0" }).guests).toBeDefined();
    expect(validateEnquiry("degustacia", { ...base, guests: "2.5" }).guests).toBeDefined();
    expect(validateEnquiry("degustacia", { ...base, guests: "6" })).toEqual({});
  });

  it("ubytovanie: odchod musí byť po príchode", () => {
    const base = { name: "Eva", email: "e@e.sk", guests: "2", arrival: "2027-05-10" };
    expect(validateEnquiry("ubytovanie", { ...base, departure: "2027-05-10" }).departure).toBeDefined();
    expect(validateEnquiry("ubytovanie", { ...base, departure: "2027-05-12" })).toEqual({});
  });

  it("firma: vyžaduje firmu a množstvo", () => {
    const errors = validateEnquiry("firma", { name: "Ján", email: "j@e.sk", message: "Chceme dary" });
    expect(Object.keys(errors).sort()).toEqual(["company", "quantity"]);
  });
});
