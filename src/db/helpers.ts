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
	TurfLocation
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

export async function getStopByTurfLocation(turfLocation: TurfLocation): Promise<TurfLocation> {
	const db = DB.getInstance();
	let res = await db.query('SELECT * FROM stop WHERE location_id = $1', [locationId]);
	return res.rows[0];
}

// returns an array with the stopId and turfLocation for each stop on a route
export async function getTurfLocationsForRoute(rtl: RouteStopsLinkedList):Promise<Array<{}>>  {
	let res: {}[] = [];
	const stops = rtl.stops;
	for (let stop of stops) {
		let stopLocation = await getStopByLocationId(stop[1]['location_id']);
		let stopId = stopLocation[1].id
		let turfLocation: TurfLocation = [stopLocation[1].longitude, stopLocation[1].latitude];
		res.push({ stopId, turfLocation });
	}
	return res;
}

export async function checkProximity(request: Request): Promise <Array<{}>> {
	const db = DB.getInstance();
	let routesAndStops = await db.fetchRoutesAndStops()
	let validRoutes: Array<any> = [];
	const pickup = await getLocationByStopId(request.origin_stop_id);
	const pickupTurfLocation: TurfLocation = [pickup.longitude, pickup.latitude];
	const dropOff = await getLocationById(request.destination_stop_id);
	const dropOffTurfLocation: TurfLocation = [dropOff.longitude, dropOff.latitude];

	for (let route of routesAndStops) {
		let routeId = route.id;
		let stopsAndTurfLocations = await getTurfLocationsForRoute(route);
		let stops = stopsAndTurfLocations.map(o => o['stopId'])
		let turfLocations = stopsAndTurfLocations.map(o => o['turfLocation'])
		let validStopsAfterPickup: Stop[] = []; //
		let validStopsAfterDropOff: Stop[] = [];
		for (let j = 1; j < turfLocations.length; j++) {
			let validPickupLocation = isWithinRouteDeviation(pickupTurfLocation, turfLocations[j-1], turfLocations[j]);
			if (validPickupLocation) {
				validStopsAfterPickup.push(stops[j]);
			}
			let validDropOffLocation = isWithinRouteDeviation(dropOffTurfLocation, turfLocations[j-1], turfLocations[j]);
			if (validDropOffLocation) {
				validStopsAfterDropOff.push(stops[j]);
			}
		}
		validRoutes.push({ routeId: { locationsBP: validStopsAfterPickup, locationsBD: validStopsAfterDropOff } })
	}
	return validRoutes;
}
