import DB from "./db";


function fetchWeights(routeId: number) {
    //get db singleton
    const db = DB.getInstance();
    const route_and_stops = await db.fetchRouteAndStopsByID(routeId);
    for (let stop of route_and_stops.stops) {
        
    }
}
