const fs = require("fs");
const vm = require("vm");

// Load Code.gs into a VM context so we can call ensureTriggers.
const code = fs.readFileSync(require.resolve("../Code.gs"), "utf8");

let ScriptApp;
let SpreadsheetApp;

beforeEach(() => {
  let triggers = [];
  function Trigger(handler, type) {
    this.handlerFunction = handler;
    this.eventType = type;
  }
  Trigger.prototype.getHandlerFunction = function () {
    return this.handlerFunction;
  };
  Trigger.prototype.getEventType = function () {
    return this.eventType;
  };

  ScriptApp = {
    EventType: { CLOCK: "CLOCK", ON_EDIT: "ON_EDIT" },
    WeekDay: { MONDAY: "MONDAY" },
    newTrigger(fn) {
      const trigger = {
        _handler: fn,
        timeBased() {
          this._type = "CLOCK";
          return this;
        },
        onMonthDay() {
          return this;
        },
        atHour() {
          return this;
        },
        onWeekDay() {
          return this;
        },
        forSpreadsheet() {
          return this;
        },
        onEdit() {
          this._type = "ON_EDIT";
          return this;
        },
        create() {
          const t = new Trigger(this._handler, this._type);
          triggers.push(t);
          return t;
        }
      };
      return trigger;
    },
    getProjectTriggers() {
      return triggers.slice();
    },
    deleteTrigger(t) {
      triggers = triggers.filter((tr) => tr !== t);
    }
  };
  SpreadsheetApp = {
    getActive: jest.fn(() => ({}))
  };
  const context = vm.createContext({ ScriptApp, SpreadsheetApp });
  vm.runInContext(code, context);
  global.ensureTriggers = context.ensureTriggers;
});

test("ensureTriggers removes duplicates and creates missing", () => {
  ensureTriggers();
  ensureTriggers();
  const triggers = ScriptApp.getProjectTriggers();
  const counts = {};
  triggers.forEach((t) => {
    const key = t.getHandlerFunction() + "|" + t.getEventType();
    counts[key] = (counts[key] || 0) + 1;
  });
  expect(counts["runMonthlyBilling|CLOCK"]).toBe(1);
  expect(counts["refreshDashboards|CLOCK"]).toBe(1);
  expect(counts["addService|ON_EDIT"]).toBe(1);
});
