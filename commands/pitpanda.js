import { createProfile } from '../components/profile';
import { createHomePage } from '../components/homePage';
import { nameParam } from "../utils";
import { addCustomCompletion } from '../../CustomTabCompletions';
import { browser } from '../browser';
import Promise from '../Promise';

const pitPandaCommand = register('command', name => {
  if(!name) browser.openPage(Promise.resolve(createHomePage()));
  else browser.openPage(createProfile(name));
}).setName('pitpanda');
addCustomCompletion(pitPandaCommand, nameParam);
