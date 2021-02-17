import { getSetting, subscribeToSetting } from "../settings";
import { onEnterPit, getMap } from "../utils";

let currentHeight = Infinity;
const mapHeights = {
  'The Pit Genesis': 85.5,
  'The Pit Seasons': 113.5,
  'The Pit': 113.5,
  'The Pit Abyss': 113.5,
  'The Pit Castle': 94.5
}

const renderInSpawnTrigger = register('renderEntity', (entity, pos, pticks, event) => {
  if(entity.getY() > currentHeight && entity.getClassName().equals('EntityOtherPlayerMP')) event.setCanceled(true);
}).unregister();

onEnterPit(() => {
  getMap().then(map => {
    if(map in mapHeights) currentHeight = mapHeights[map];
  });

  if(!getSetting('SpawnPlayersVisibility')) renderInSpawnTrigger.register();

  const subscription = subscribeToSetting('SpawnPlayersVisibility', state => {
    if(state) renderInSpawnTrigger.unregister();
    else renderInSpawnTrigger.register();
  });

  return () => {
    renderInSpawnTrigger.unregister();
    subscription.unsubscribe();
  }
});
