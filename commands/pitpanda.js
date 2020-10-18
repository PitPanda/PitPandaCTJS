import { createProfile } from '../pages/profile';
import { createHomePage } from '../pages/home';
import { nameParam } from "../utils";
import { addCustomCompletion } from '../../CustomTabCompletions';
import { browser } from '../browser';
import Promise from '../Promise';

const pitPandaCommand = register('command', name => {
  if(!name) browser.openPage(Promise.resolve(createHomePage()));
  else browser.openPage(createProfile(name));
}).setName('pitpanda');
addCustomCompletion(pitPandaCommand, nameParam);
