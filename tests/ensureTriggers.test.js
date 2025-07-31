const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

// Simple in-memory trigger representation
let triggers = [];

const ScriptApp = {
  WeekDay: { MONDAY: "MONDAY" },
  EventType: { CLOCK: "CLOCK", ON_EDIT: "ON_EDIT" },
  newTrigger(handler) {
    const trigger = {
      handler,
      spreadsheet: null,
      eventType: null,
      timeBased() {
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
      forSpreadsheet(ss) {
        this.spreadsheet = ss;
        return this;
      },
      onEdit() {
        this.eventType = ScriptApp.EventType.ON_EDIT;
        return this;
      },
      create() {
        const obj = {
          getHandlerFunction: () => handler,
          getEventType: () => this.eventType || ScriptApp.EventType.CLOCK
        };
        triggers.push(obj);
        return obj;
      }
    };
    return trigger;
  },
  getProjectTriggers() {
    return Array.from(triggers);
  },
  deleteTrigger(t) {
    const idx = triggers.indexOf(t);
    if (idx >= 0) {
      triggers.splice(idx, 1);
    }
  }
};

const SpreadsheetApp = {
  getActive() {
    return {};
  }
};

const context = {
  ScriptApp,
  SpreadsheetApp,
  ContentService: {},
  SpreadsheetApp2: SpreadsheetApp,
  Logger: console
};

const code = fs.readFileSync("src/Code.gs", "utf8");
vm.createContext(context);
vm.runInContext(code, context);

// First run should create all triggers
context.ensureTriggers();
assert.strictEqual(triggers.length, 3);

// Second run should not create duplicates
context.ensureTriggers();
assert.strictEqual(triggers.length, 3);

// Ensure each handler appears once
const counts = {};
triggers.forEach((t) => {
  const key = `${t.getHandlerFunction()}-${t.getEventType()}`;
  counts[key] = (counts[key] || 0) + 1;
});
assert.deepStrictEqual(counts, {
  "runMonthlyBilling-CLOCK": 1,
  "refreshDashboards-CLOCK": 1,
  "addService-ON_EDIT": 1
});

console.log("All tests passed.");
