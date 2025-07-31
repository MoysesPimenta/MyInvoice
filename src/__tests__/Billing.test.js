const fs = require("fs");
const vm = require("vm");

const code = fs.readFileSync(require.resolve("../Billing.gs"), "utf8");

let getStorageCharges;
let getServiceCharges;
let createInvoice;

beforeEach(() => {
  const context = vm.createContext({});
  vm.runInContext(code, context);
  getStorageCharges = context.getStorageCharges;
  getServiceCharges = context.getServiceCharges;
  createInvoice = context.createInvoice;
});

test("getStorageCharges collects stored machines", () => {
  const sheet = {
    values: [
      ["id", "name"],
      ["m1", "Machine 1", "c1", 5, "", "", "stored"],
      ["m2", "Machine 2", "c2", 10, "", "", "active"]
    ],
    getDataRange() {
      return {
        getValues: () => this.values
      };
    },
    setCalls: [],
    getRange(r, c) {
      return {
        setValue: (v) => this.setCalls.push({ r, c, v })
      };
    }
  };
  const charges = getStorageCharges(sheet, new Date("2024-01-01"));
  expect(charges.c1).toHaveLength(1);
  expect(charges.c1[0].description).toContain("m1");
  expect(sheet.setCalls).toHaveLength(1);
});

test("getServiceCharges collects unbilled services", () => {
  const sheet = {
    values: [
      [],
      ["svc1", "", "c1", "", "", "Desc", "", "", 20, ""],
      ["svc2", "", "c2", "", "", "Desc2", "", "", 30, "YES"]
    ],
    getDataRange() {
      return { getValues: () => this.values };
    },
    setCalls: [],
    getRange(r, c) {
      return { setValue: (v) => this.setCalls.push({ r, c, v }) };
    }
  };
  const charges = getServiceCharges(sheet);
  expect(charges.c1).toHaveLength(1);
  expect(charges.c2).toBeUndefined();
  expect(sheet.setCalls).toHaveLength(1);
});

test("createInvoice appends a row and returns details", () => {
  let appended;
  const sheet = {
    appendRow: (row) => {
      appended = row;
    }
  };
  const items = [
    { description: "A", price: 5 },
    { description: "B", price: 10 }
  ];
  const result = createInvoice(
    sheet,
    "c1",
    items,
    new Date("2024-01-01"),
    7,
    2024,
    0
  );
  expect(result.invoiceId).toBe(8);
  expect(result.total).toBe(15);
  expect(appended[0]).toBe(8);
  expect(appended[1]).toBe("c1");
});
