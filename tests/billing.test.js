const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('./src/Billing.gs', 'utf8');
const context = {
  console,
};
vm.createContext(context);
vm.runInContext(code, context);

function makeSheet(data) {
  return {
    _data: data,
    getDataRange() {
      return {
        getValues: () => this._data,
      };
    },
    getRange(r, c) {
      return {
        setValue: (val) => {
          this._data[r - 1][c - 1] = val;
        },
      };
    },
  };
}

(function testGetStorageCharges() {
  const sheet = makeSheet([
    ['ID', 'Name', 'ClientID', 'Rate', '', '', '', 'LastBilled'],
    ['M1', 'Mac', 'C1', 50, '', '', 'stored', ''],
    ['M2', 'Mac', 'C2', 30, '', '', '', ''],
  ]);
  const charges = JSON.parse(
    JSON.stringify(context.getStorageCharges(sheet, new Date('2024-01-01')))
  );
  assert.deepStrictEqual(charges, {
    C1: [{ description: 'Storage for M1', price: 50 }],
  });
  assert.ok(sheet._data[1][7]);
})();

(function testGetServiceCharges() {
  const sheet = makeSheet([
    ['ID', '', 'ClientID', '', '', 'Desc', '', '', 'Price', 'Billed'],
    ['S1', '', 'C1', '', '', 'Fix', '', '', 100, 'NO'],
    ['S2', '', 'C1', '', '', 'Setup', '', '', 150, 'YES'],
  ]);
  const charges = JSON.parse(
    JSON.stringify(context.getServiceCharges(sheet))
  );
  assert.deepStrictEqual(charges, {
    C1: [{ description: 'Fix', price: 100 }],
  });
  assert.strictEqual(sheet._data[1][9], 'YES');
})();

(function testCreateInvoices() {
  const rows = [
    ['ID'],
  ];
  const invoicesSheet = {
    _rows: rows,
    getLastRow() {
      return this._rows.length;
    },
    appendRow(row) {
      this._rows.push(row);
    },
  };
  const pdfCalls = [];
  context.generateInvoicePDF = (...args) => pdfCalls.push(args);
  const map = { C1: [{ description: 'd', price: 20 }] };
  context.createInvoices(map, invoicesSheet, 2024, 0, new Date('2024-01-15'));
  assert.strictEqual(invoicesSheet._rows.length, 2);
  assert.strictEqual(pdfCalls.length, 1);
})();
