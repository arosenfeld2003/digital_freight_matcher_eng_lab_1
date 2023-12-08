import { getDistanceByStop } from "@db/helpers";
import { RouteStopsLinkedList } from "../db/types";
import { getInsertedDisByStopID } from "../db/helpers";

export async function getDistanceStopMap(routeId: number): Promise<Map<number, number>>
{
    let distance_map = new Map<number, number>();
    let db = DB.getInstance();
    

    //TODO: handle undefined better than this
    //stops may actually be "stopNode" objects
    //let stops: Stop[] = [];
    const route_and_stops: RouteStopsLinkedList = await db.fetchRouteAndStopsByID(routeId) ?? {};
    let stops = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];});

    for (let my_stop of stops)
    {
        let distance = await getDistanceByStop(my_stop);
        distance_map.set(my_stop.id, distance);
    }
    return distance_map;
}

export async function total_map(my_map: Map<any, number>): Promise<number>
{
    let distance = 0;
    for (let key of my_map.keys())
    {
        distance += my_map.get(key) ?? 0;
    }
    return distance;
}

export async function createModifiedDistanceMap(base_dis_map: Map<number, number>, stopId_AD: number): Promise<Map<number, number>>
{
    let mod_dis_map = new Map<number, number>(base_dis_map);
    
    for (let key of mod_dis_map.keys())
    {
        mod_dis_map[key] = getInsertedDisByStopID(key, stopId_AD);
    }

    return mod_dis_map;
}