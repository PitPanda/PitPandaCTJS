import { getSetting, subscribeToSetting } from "../settings";
import { onEnterPit, getMap } from "../utils";

let currentHeight = Infinity;
const mapHeights = {
  'The Pit Genesis': 83,
  'The Pit Seasons': 111,
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
