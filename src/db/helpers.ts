import DB from '../db/db'
import {
	Route,
	Stop,
	Request,
	Location,
	Package,
	Packagetype,
	Truck,
	Client,
	RouteStopsLinkedList,
	TurfLocation,
	CheckProximityOutput
} from '@db/types'
import { isWithinRouteDeviation } from "../services/routeService";
import * as turf from "@turf/turf";

export async function getLocationByStopId(stopId: number): Promise<Location> {
	const db = DB.getInstance();
	let res = await db.query('SELECT * FROM location l\n' +
		'  JOIN stop s ON s.location_id = l.id\n' +
		'where s.id = $1',
		[stopId]);
	return res.rows[0];
}

export async function getStopByLocationId(locationId: number): Promise<Stop> {
	const db = DB.getInstance();
	let res = await db.query('SELECT * FROM stop WHERE location_id = $1', [locationId]);
	return res.rows[0];
}

export async function getStopById(stopId: number): Promise<Stop> {
	const db = DB.getInstance();
	let res = await db.query('SELECT * FROM stop WHERE id = $1', [stopId]);
	return res.rows[0];
}

// returns an array with each stop on a route and turfLocation for the coordinates of the stop
export async function getStopsAndTurfLocationsForRoute(rtl: RouteStopsLinkedList):Promise<Array<{}>>  {
	let res: {}[] = [];
	const stops = rtl.stops;
	for (let stop of stops) {
		let stopLocation = await getStopByLocationId(stop[1]['location_id']);
		let turfLocation: TurfLocation = [stopLocation[1].longitude, stopLocation[1].latitude];
		res.push({ stopLocation, turfLocation });
	}
	return res;
}

export async function getTruckMaxWeightByRouteId(routeId: number): Promise<number> {
	const db = DB.getInstance();
	let res = await db.query('SELECT max_weight FROM truck WHERE route_id = $1', [routeId]);
	return res.rows[0].max_weight;
}

export async function getTruckMaxVolumeByRouteId(routeId: number): Promise<number> {
	const db = DB.getInstance();
	let res = await db.query('SELECT max_weight FROM truck WHERE route_id = $1', [routeId]);
	return res.rows[0].max_weight;
}

/*export interface Request {
  id: number
  client_id: number
  route_id: number | null
  origin_stop_id: number
  destination_stop_id: number
  cargo_cost: number
  contract_type: string
}
*/

export async function getWeightByStop(stop: Stop): Promise<number> {
	const db = DB.getInstance();
	
	// Get the request for the stop
	let request = await db.query('SELECT * FROM request WHERE origin_stop_id = $1 OR destination_stop_id = $1', [stop.id]);

	// Get the packages for the request
	let res = await db.query('SELECT SUM(weight) FROM package WHERE request_id = $1', [request[0].id]);
	let weight = res.rows[0].sum;

	// If the stop is an origin, return the weight, otherwise return the negative weight
	if (request[0].origin_stop_id === stop.id) {
		return weight;
	} else {
		return -weight;
	}
}

export async function getWeightbyRequestId(requestId: number): Promise<number>
{
	const db = DB.getInstance();
	let res = await db.query('SELECT SUM(weight) FROM package WHERE request_id = $1', [requestId]);
	return res.rows[0].sum;
}

export async function getVolumeByStop(stop: Stop): Promise<number> {
    const db = DB.getInstance();
    
    // Get the request for the stop
    let request = await db.query('SELECT * FROM request WHERE origin_stop_id = $1 OR destination_stop_id = $1', [stop.id]);

    // Get the packages for the request
    let res = await db.query('SELECT SUM(volume) FROM package WHERE request_id = $1', [request[0].id]);
    let volume = res.rows[0].sum;

    // If the stop is an origin, return the volume, otherwise return the negative volume
    if (request[0].origin_stop_id === stop.id) {
        return volume;
    } else {
        return -volume;
    }
}

export async function getVolumebyRequestId(requestId: number): Promise<number>
{
    const db = DB.getInstance();
    let res = await db.query('SELECT SUM(volume) FROM package WHERE request_id = $1', [requestId]);
    return res.rows[0].sum;
}

export async function checkProximity(request: Request): Promise<CheckProximityOutput> {
	const db = DB.getInstance();
	let routesAndStops = await db.fetchRoutesAndStops()                                                                                                                     
	let validRoutes: CheckProximityOutput = [];
	const pickup = await getLocationByStopId(request.origin_stop_id);
	const pickupTurfLocation: TurfLocation = [pickup.longitude, pickup.latitude];
	const dropOff = await getLocationByStopId(request.destination_stop_id);
	const dropOffTurfLocation: TurfLocation = [dropOff.longitude, dropOff.latitude];

	for (let route of routesAndStops) {
		let stopsAndTurfLocations = await getStopsAndTurfLocationsForRoute(route);
		let validStopsAfterPickup: Stop[] = [];
		let validStopsAfterDropOff: Stop[] = [];
		for (let j = 1; j < stopsAndTurfLocations.length; j++) {
			let stopBefore = stopsAndTurfLocations[j-1]
			let currentStop = stopsAndTurfLocations[j]

			//duplicate lists, consider DRYing up
			let validPickupLocation = isWithinRouteDeviation(pickupTurfLocation, stopBefore['turfLocation'], currentStop['turfLocation']);
			if (validPickupLocation) {
				validStopsAfterPickup.push(stopsAndTurfLocations[j]['stop']);
			}
			let validDropOffLocation = isWithinRouteDeviation(dropOffTurfLocation, stopBefore['turfLocation'], currentStop['turfLocation']);
			if (validDropOffLocation) {
				validStopsAfterDropOff.push(stopsAndTurfLocations[j]['stop']);
			}
		}
		validRoutes.push({ routeId: route.id, stopsAP: validStopsAfterPickup, stopsAD: validStopsAfterDropOff });
	}
	return validRoutes;
}
