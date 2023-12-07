import { EntryPoint } from "../models/EntryPoint";
import { Request } from "../models/Request";
import { Stop } from "../models/Stop";
import { DB } from "../db/db";
import { getDistanceByStop } from "@db/helpers";
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
    // TODO: Modify the map as needed

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

    ///CALCULATING AVAILABLE TIME FOR DRIVING =====================================
    //get max time from .env
    const max_time = <number>(process.env.MAX_TIME ?? 600); //in minutes
    const time_per_stop = <number>(process.env.DELIVERY_TIME ?? 15); //in minutes *ALSO* see TODO later in this function
    
    

    //get distance dictionary
    const base_dis_map = await getDistanceStopMap(routeId);
    const stopAD_dis_map = await createModifiedDistanceMap(base_dis_map, request.destination_stop_id);
    
    //TODO: replace with summmed time per stop, see getStopTimesByRouteId in helpers.ts
    //get time per stop from .env instead
    const time_from_stops = (Object.keys(distance_dict).length + 2) * time_per_stop; //+2 for origin and destination stops that we are attempting to add
    
    const max_driving_time = max_time - time_from_stops;

    ///CALCULATING AVAILABLE DISTANCE =====================================
    const truck_speed = await db.fetchTruckSpeedByRouteId(routeId);

    const max_driving_distance = max_driving_time * truck_speed;
    const available_distance = max_driving_distance - await total_map(stopAD_dis_map);


    ///GENERATE BOOLEAN ARRAY GIVEN DISTANCE CONSTRAINT ============================
    
    for (key in stopAD_dis_map.keys())
    {
        
    }

    //return not implemented
    return [];
}