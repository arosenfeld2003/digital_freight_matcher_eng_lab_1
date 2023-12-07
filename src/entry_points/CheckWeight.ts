import { getWeightByStop, getWeightbyRequestId } from "@db/helpers";
import { EntryPoint, EntryPoints } from "@db/types";
import { Request, Stop} from "@db/types";
import DB from "@db/db";
import { getTruckMaxWeightByRouteId } from "@db/helpers";

async function getAvailableWeightStopDict(routeId: number, request: Request): Promise<{ [key: number]: number; }> {
    //get db singleton
    const db = DB.getInstance();
    const truck_max_weight: number = await getTruckMaxWeightByRouteId(routeId);
    
    //stops may actually be "stopNode" objects
    let stops: Stop[] = [];
    const route_and_stops = await db.fetchRouteAndStopsByID(routeId);
    if (route_and_stops != undefined) {
        stops = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];})
    }

    //TODO: error handling

    //parrallelize this?
    let weight_changes:{[key: number]: number } = {};
    for (let stop of stops) {
        weight_changes[stop.id] = await getWeightByStop(stop);
    }

    let acc = 0;
    let weight_available: { [key: number]: number } = {};
    for (let stopId in weight_changes) {
        acc += weight_changes[stopId];
        weight_available[stopId] = truck_max_weight - acc;
    }
    return weight_available;
}

export async function checkWeight(routeId: number, entryPoint_arr: EntryPoint[], request: Request): Promise<boolean[][]> {
    const available_weights = await getAvailableWeightStopDict(routeId, request);

    //get weight of request
    const required_weight = await getWeightbyRequestId(request.id);

    //transform entryPoint into a referenced boolean array where true means the stop has at least the required weight
    const boolean_array_base: boolean[] = entryPoint_arr[0].stops_after_dropoff.map((stop) => {return available_weights[stop.id] >= required_weight;});
    
    //make array 2D where each row represents different stop_after_pickup and columns are filled with the base array from after the stop after pickip
    let boolean_array: boolean[][] = [];
    for (let i = 0; i < entryPoint_arr.length; i++) {
        boolean_array.push(boolean_array_base.slice(i));
    }

    //modify this array to remove drop off points that go over the limit
    let continuous_true: Boolean = true;
    boolean_array.map((row) => row.map((value) => {continuous_true = continuous_true && value; return continuous_true;}));
    
    return boolean_array;
}
