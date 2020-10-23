import { createProfilePage } from '../components/pages/profile';
import { createHomePage } from '../components/pages/home';
import { nameParam } from "../utils";
import { addCustomCompletion } from '../../CustomTabCompletions';
import { browser } from '../browser';

const pitPandaCommand = register('command', name => {
  if(!name) browser.openWindow();
  else browser.openPage(createProfilePage(name));
}).setName('pitpanda');
addCustomCompletion(pitPandaCommand, nameParam);
