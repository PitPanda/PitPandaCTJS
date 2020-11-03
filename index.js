/// <reference types="../CTAutocomplete" />
/// <reference types="./depTypes" />
/// <reference types="./myTypes" />
/// <reference lib="es2015" />

import './commands/pitpanda';
import './commands/other';
import './features/clickOpenProfile';
import './features/spawnPlayersVisibility';
import { getSetting } from './settings';

if(getSetting('DeveloperMode')) console.log('----- Loading PitPanda -----')
