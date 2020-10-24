const { ModuleDir } = require("./constants");

const settingsPath = `${ModuleDir}/local.json`;

const defaults = {};

const raw = FileLib.read(settingsPath);

console.log(raw);

const settings = JSON.parse(raw || JSON.stringify(defaults)); // this looks weird, but its so that we dont modify defaults;

register('gameUnload', () => {
  FileLib.write(settingsPath, JSON.stringify(settings))
});

