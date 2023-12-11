import { getDistanceByStop } from "@db/helpers";
import { RouteStopsLinkedList } from "../db/types";
import { getInsertedDisByStopID } from "../db/helpers";

//confusing redundancy
import { Stop } from "../db/types";
import { StopNode } from "../db/types";
import { convertStopNodeToStop } from "../db/helpers";
import { EntryPoint } from "../db/types";
import { Request } from "../db/types";


import DB from "../db/db";

export async function getDistanceStopMap(routeId: number): Promise<Map<number, number>>
{
    let distance_map = new Map<number, number>();
    let db = DB.getInstance();

    //TODO: handle undefined better than this
    //stops may actually be "stopNode" objects
    //let stops: Stop[] = [];
    const route_and_stops: RouteStopsLinkedList = (await db.fetchRouteAndStopsByID(routeId))!;
    let stop_nodes: StopNode[] = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];});

    for (const my_stop_node of stop_nodes)
    {
        const stop = await convertStopNodeToStop(my_stop_node);
        const distance = await getDistanceByStop(stop);
        distance_map.set(stop.id, distance);
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


export async function getDistanceArr(route_id: number, entry_point_arr: EntryPoint[], req: Request): Promise<number[][]>
{
    const og_dis_map = await getDistanceStopMap(route_id);
    const og_dis_total = await total_map(og_dis_map);

    const pu_dis_map = await createModifiedDistanceMap(og_dis_map, req.origin_stop_id);
    const du_dis_map = await createModifiedDistanceMap(og_dis_map, req.destination_stop_id);

    let distance_arr: number[][] = [];
    //replaces stop ids with new total distance
    for (let entry_point of entry_point_arr)
    {
        distance_arr.push([]);
        for (let stop of entry_point.stops_after_dropoff)
        {
            const pickup_change = pu_dis_map[entry_point.stop_after_pickup.id] - og_dis_map[entry_point.stop_after_pickup.id];
            const dropoff_change = du_dis_map[stop.id] - og_dis_map[stop.id];
            distance_arr[distance_arr.length - 1].push(og_dis_total + pickup_change + dropoff_change);
        }
    }

    return distance_arr;
}