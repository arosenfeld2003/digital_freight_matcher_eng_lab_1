import { EntryPoint, Request, Stop } from "../db/types";
import { DB } from "../db/db";
import { getDistanceByStop } from "@db/helpers";
import { getInsertedDisByStopID } from "@db/helpers";
import * as dotenv from "dotenv";

/*
** Note: This whole file shouldn't really be using maps, but rather arrays
**
**
**
*/


async function getDistanceStopMap(routeId: number): Promise<Map<number, number>>
{
    let distance_map = new Map<number, number>();
    let db = DB.getInstance();
    

    //TODO: handle undefined better than this
    //stops may actually be "stopNode" objects
    let stops: Stop[] = [];
    const route_and_stops = await db.fetchRouteAndStopsByID(routeId);
    if (route_and_stops != undefined) {
        stops = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];})
    }

    for (let my_stop of stops)
    {
        let distance = await getDistanceByStop(my_stop);
        distance_map.set(my_stop.id, distance);
    }
    return distance_map;
}

async function total_map(my_map: Map<any, number>): Promise<number>
{
    let distance = 0;
    for (let key of my_map.keys())
    {
        distance += my_map.get(key) ?? 0;
    }
    return distance;
}

// async function getTotalDistance(routeId: number): Promise<Number>
// {
//     let distance = 0
//     let db = DB.getInstance();
    

//     //TODO: handle undefined better than this
//     //stops may actually be "stopNode" objects
//     let stops: Stop[] = [];
//     const route_and_stops = await db.fetchRouteAndStopsByID(routeId);
//     if (route_and_stops != undefined) {
//         stops = Array.from(route_and_stops.stops.values()).map((stop_obj) => {return stop_obj[1];})
//     }

//     for (let my_stop of stops)
//     {
//         let stop_distance = await getDistanceByStop(my_stop);
//         distance += stop_distance;
//     }
//     return distance;
// }

async function createModifiedDistanceMap(base_dis_map: Map<number, number>, stopId_AD: number): Promise<Map<number, number>>
{
    let mod_dis_map = new Map<number, number>(base_dis_map);
    
    for (let key of mod_dis_map.keys())
    {
        mod_dis_map[key] = getInsertedDisByStopID(key, stopId_AD);
    }

    return mod_dis_map;
}

// //as in db/types.ts
// export type EntryPoint = {
//     stop_after_pickup: Stop,
//     stops_after_dropoff: Stop[]
//   };


export async function checkTime(routeId: number, entryPoint_arr: EntryPoint[], request: Request): Promise<boolean[][]>
{
    //get db singleton
    const db = DB.getInstance();

    //get max time from .env
    const max_time = <number>(process.env.MAX_TIME ?? 600); //in minutes

    ///CALCULATING AVAILABLE TIME SPENT DURING STOPS =====================================
    const time_per_stop = <number>(process.env.DELIVERY_TIME ?? 15); //in minutes *ALSO* see TODO later in this functioN

    //get distance dictionary
    const base_dis_map = await getDistanceStopMap(routeId); //map of distance from previous stop by stop id
    const stopAD_dis_map = await createModifiedDistanceMap(base_dis_map, request.destination_stop_id); // map of distance from previous stop assuming you stop at the destination in between. (used later, but place here due to it's relation to original map)
    
    //TODO: replace with summmed time per stop, see getStopTimesByRouteId in helpers.ts
    //get time per stop from .env instead
    const time_from_stops = (Object.keys(base_dis_map).length + 2) * time_per_stop; //+2 for origin and destination stops that we are attempting to add
    
    ///USE TIME CONSTRAINT TO CALCULATE MAX DRIVING TIME ===========================
    const max_driving_time = max_time - time_from_stops;

    ///CALCULATING AVAILABLE DISTANCE FROM MAX TIME =====================================
    const truck_speed = await db.fetchTruckSpeedByRouteId(routeId);
    const max_driving_distance = max_driving_time * truck_speed;
    const available_distance = max_driving_distance - await total_map(stopAD_dis_map);


    ///GENERATE BOOLEAN ARRAY GIVEN DISTANCE CONSTRAINT ============================
    let re_boolean_array = [];
    for (let [idx, entry_point] of Object.entries(entryPoint_arr))
    {
        const effective_max = available_distance - await getInsertedDisByStopID(entry_point.stop_after_pickup.id, request.origin_stop_id);
        
        //creates boolean array where true for i means getInsertedDisByStopID(entryPoint.stops_after_dropoff[i].id, request.destination_stop_id) <= effective_max
        //map used for caching purposes
        //consider using .map instead of for loop
        for (const my_stop of entry_point.stops_after_dropoff)
        {
            const additional_dis = stopAD_dis_map[my_stop.id] - base_dis_map[my_stop.id];
            re_boolean_array[idx] = additional_dis <= effective_max;
        }
    }

    return re_boolean_array;
}