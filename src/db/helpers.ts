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

export async function getLocationById(locationId: number): Promise<Location> {
	const db = DB.getInstance();
	let res = await db.query('SELECT * FROM location WHERE id = $1', [locationId]);
	return res.rows[0];
}

export async function getTurfLocationsForRoute(rtl: RouteStopsLinkedList):Promise<Array<TurfLocation>>  {
	let res: TurfLocation[] = []
	const stops = rtl.stops;
	for (let stop of stops) {
		let stopLocation = await getLocationById(stop[1]['location_id']);
		let turfLocation: TurfLocation = [stopLocation.longitude, stopLocation.latitude];
		res.push(turfLocation);
	}
	return res;
}

export async function checkProximity(request: Request): Promise <Array<{}>> {
	const db = DB.getInstance();
	let routesAndStops = await db.fetchRoutesAndStops()
	let validRoutes: Array<any> = [];
	const pickup = await getLocationById(request.origin_stop_id);
	const pickupTurfLocation: TurfLocation = [pickup.longitude, pickup.latitude];
	const dropOff = await getLocationById(request.destination_stop_id);
	const dropOffTurfLocation: TurfLocation = [dropOff.longitude, dropOff.latitude];

	for (let route of routesAndStops) {
		let routeId = route.id;
		let locations = await getTurfLocationsForRoute(route);
		for (let j = 0; j < locations.length; j++) {
			let isValid = isWithinRouteDeviation(locations[j], pickupTurfLocation, dropOffTurfLocation);
			if (isValid) {
				validRoutes.push({ routeId: [ request.origin_stop_id, request.destination_stop_id ] })
			}
		}
	}

	return validRoutes;
}
