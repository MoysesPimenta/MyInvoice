require.extensions['.gs'] = require.extensions['.js'];
const { getStorageCharges, getServiceCharges, createInvoice } = require('../src/Billing.gs');

function createMockSheet(data) {
  return {
    getDataRange() {
      return {
        getValues: () => data
      };
    },
    getRange(row, col) {
      return {
        setValue: jest.fn()
      };
    },
    appendRow: jest.fn()
  };
}

describe('billing helpers', () => {
  test('getStorageCharges collects charges per client', () => {
    const sheet = createMockSheet([
      ['Name', 'unused', 'Client', 'Rate', '', '', 'Status'],
      ['A', '', '1', 10, '', '', 'stored'],
      ['B', '', '2', 5, '', '', 'active']
    ]);
    const result = getStorageCharges(sheet, new Date('2023-01-01'));
    expect(result['1']).toHaveLength(1);
    expect(result['2']).toBeUndefined();
  });

  test('getServiceCharges marks services billed', () => {
    const sheet = createMockSheet([
      [],
      ['', '', '1', '', '', 'Desc', '', '', 100, '']
    ]);
    const result = getServiceCharges(sheet);
    expect(result['1'][0].description).toBe('Desc');
  });

  test('createInvoice appends invoice row and returns info', () => {
    const sheet = createMockSheet([]);
    const info = createInvoice(
      sheet,
      '1',
      [{ description: 'd', price: 5 }],
      1,
      new Date('2023-01-01')
    );
    expect(info.total).toBe(5);
    expect(typeof info.tableHtml).toBe('string');
  });
});
