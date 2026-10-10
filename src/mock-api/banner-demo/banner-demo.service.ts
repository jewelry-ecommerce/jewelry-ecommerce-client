import { bannerCommandSchema, type BannerDemoCommand, type BannerDemoStore } from './banner-demo.schema';
import { readBannerDemoStore, writeBannerDemoStore } from './banner-demo.repository';
import { enrichLayout, findLayout, findPlacement, listPlacements } from './banner-demo.queries';
import { postBanner, patchBanner, postPlacement, patchPlacement, deletePlacement } from './banner-demo.mutations';
import { postPlacementLayout, patchPlacementLayoutItem } from './banner-demo.layout-mutations';
let pendingOperation: Promise<unknown> = Promise.resolve();
function execute(store: BannerDemoStore, command: BannerDemoCommand): unknown {
  switch (command.operation) {
    case 'getPlacementList': return listPlacements(store, command.query);
    case 'getPlacementLayoutList':
      findPlacement(store, command.placementId);
      return store.layouts.filter(layout => layout.placementId === command.placementId).map(layout => enrichLayout(store, layout));
    case 'getPlacementLayoutDetail': return enrichLayout(store, findLayout(store, command.placementId, command.layoutId));
    case 'postPlacement': return postPlacement(store, command);
    case 'patchPlacement': return patchPlacement(store, command);
    case 'deletePlacement': return deletePlacement(store, command);
    case 'postBanner': return postBanner(store, command);
    case 'patchBanner': return patchBanner(store, command);
    case 'postPlacementLayout': return postPlacementLayout(store, command);
    case 'patchPlacementLayoutItem': return patchPlacementLayoutItem(store, command);
  }
}
async function perform(body: unknown): Promise<unknown> {
  const command = bannerCommandSchema.parse(body);
  const store = await readBannerDemoStore();
  const result = execute(store, command);
  if (!command.operation.startsWith('get')) await writeBannerDemoStore(store);
  return result;
}
export function executeBannerDemoCommand(body: unknown): Promise<unknown> {
  const operation = pendingOperation.then(() => perform(body));
  pendingOperation = operation.catch(() => undefined);
  return operation;
}
