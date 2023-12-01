import DB from '../db/db'
import { checkProximity } from '../db/helpers';
import { Request } from '../db/types'; // Add missing import for Request type

// Definition of the entry point
// { routeId: { locationsAP: stop[], locationsAD: stop[]} }

export async function getEntryPoints(request: Request): Promise<Array<{}>> // Add async keyword and export function
{
    // Instantiate the database
    const db = DB.getInstance();
    // Get all routes and stops that are proximal to the request
    let entryPoints: Array<{}> = await checkProximity(request);

    entryPoints = entryPoints.filter(item => 
      check_weight(item, request) &&
      check_volume(item, request) &&
      check_distance(item, request) &&
      check_time(item, request)      
    );
    return entryPoints;
}