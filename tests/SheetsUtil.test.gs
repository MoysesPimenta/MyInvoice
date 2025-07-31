// @flow
/**
 * QUnit tests for ensureSheets utility.
 */
function SheetsUtilTestSuite() {
  QUnit.module("SheetsUtil");

  QUnit.test(
    "ensureSheets creates missing sheets and headers",
    function (assert) {
      var ss = SpreadsheetApp.getActive();
      var names = [
        "Machines",
        "Services",
        "BillingConfig",
        "Clients",
        "Invoices",
        "Dashboards"
      ];
      names.forEach(function (name) {
        var sheet = ss.getSheetByName(name);
        if (sheet) {
          ss.deleteSheet(sheet);
        }
      });

      ensureSheets();

      names.forEach(function (name) {
        assert.ok(ss.getSheetByName(name), "Sheet " + name + " exists");
      });
    }
  );
}
