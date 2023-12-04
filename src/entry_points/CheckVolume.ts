import { getVolumeByStop, getVolumebyRequestId } from "@db/helpers";
import { EntryPoint, EntryPoints } from "@db/types";
import { Request, Stop} from "@db/types";
import DB from "@db/db";
import { getTruckMaxVolumeByRouteId } from "@db/helpers";

async function getAvailableVolumeStopDict(routeId: number, request: Request): Promise<{ [key: number]: number; }> {
    //get db singleton
    const db = DB.getInstance();
    const truck_max_volume: number = await getTruckMaxVolumeByRouteId(routeId);
    let stops: Stop[] = [];
    const route_and_stops = await db.fetchRouteAndStopsByID(routeId);
    if (route_and_stops != undefined) {
        stops = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];})
    }

    //TODO: error handling

    let volume_changes:{[key: number]: number } = {};
    for (let stop of stops) {
        volume_changes[stop.id] = await getVolumeByStop(stop);
    }

    let acc = 0;
    let volume_available: { [key: number]: number } = {};
    for (let stopId in volume_changes) {
        acc += volume_changes[stopId];
        volume_available[stopId] = truck_max_volume - acc;
    }
    return volume_available;
}

export async function checkVolume(routeId: number, entryPoint_arr: EntryPoint[], request: Request): Promise<boolean[][]> {
    const available_volumes = await getAvailableVolumeStopDict(routeId, request);

    //get volume of request
    const required_volume = await getVolumebyRequestId(request.id);

    //transform entryPoint into boolean array where true means the stop has at least the required volume
    let boolean_array_base: boolean[] = entryPoint_arr[0].stops_after_dropoff.map((stop) => {return available_volumes[stop.id] >= required_volume;});
    
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