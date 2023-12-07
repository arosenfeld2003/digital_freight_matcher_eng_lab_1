import DB from '../db/db'
import { checkProximity } from '../db/helpers';
import { Request } from '../db/types'; // Add missing import for Request type
import { EntryPoint, EntryPoints } from '../db/types';
import { Stop } from '../db/types';
import { CheckProximityOutput } from '../db/types';
import { checkWeight } from '../entry_points/checkWeight';
import { checkVolume } from '../entry_points/checkVolume';
import { checkTime } from '../entry_points/checkTime';
import { checkDistance } from './CheckTime';

function convertCheckProximityOutputToEntryPoints(data: CheckProximityOutput): EntryPoints {
  const entryPoints: EntryPoints = {};
  data.forEach(({ routeId, stopsAP, stopsAD }) => {
    const routeData = stopsAP.map((stopAP, index) => ({
      stop_after_pickup: stopAP,
      stops_after_dropoff: stopsAD.slice(index + 1)
    }));

    entryPoints[routeId] = routeData;
  });

  return entryPoints;
}


//filter functions
async function createFilterArray(routeId: string, route_data: EntryPoint[], request: Request): Promise<boolean[][]> {
  const filters = [checkWeight, checkVolume /*, checkTime, checkProfit*/]; //TODO: add more filters //Could be improved with static singleton classes

  const filter_results = await Promise.all(filters.map(filter => filter(routeId, route_data, request)));
  
  const combined_results = filter_results.reduce((accumilator, current) => {
    return accumilator.map((row, index) => row.map(((value, index2) => value && current[index][index2])))
  });
  return combined_results;
}

async function applyFiltersByRoute(routeId: string, route_data: EntryPoint[], request: Request): Promise<EntryPoint[]> {
  let boolean_array = await createFilterArray(routeId, route_data, request);
  // iterate over boolean array and remove stops that are false
  boolean_array.forEach((row, index) => {
    //if every value in row is false, remove element from route_data for estimated performance improvements (most rows will be false)
    if (row.every(value => !value)) {
      route_data.splice(index, 1);
    }
    row.forEach((value, index2) => {
      if (!value) {
        route_data[index]['stops_after_dropoff'].splice(index2, 1);
      }
    });
  });
  
  return route_data;
}

export async function getEntryPoints(request: Request): Promise<EntryPoints> {
  const db = DB.getInstance();
  let entryPoints_array: CheckProximityOutput = await checkProximity(request);
  let entryPoints: EntryPoints = convertCheckProximityOutputToEntryPoints(entryPoints_array);
  
  // apply filters by route in parallel, return using promise.all
  const routeIds = Object.keys(entryPoints);
  await Promise.all(routeIds.map(async (routeId) => {
    entryPoints[routeId] = await applyFiltersByRoute(routeId, entryPoints[routeId], request);
  }));

  return entryPoints;
}