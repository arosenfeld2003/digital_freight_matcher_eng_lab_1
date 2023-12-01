import { get } from 'http';
import DB from '../db/db'


//definiton of the entry point
//{ routeId: { locationsBP: validLocationsBeforePickup, locationsBD: validLocationsBeforeDropOff } }



public async getEntryPoints(request: Request): Promise<Array<{}>>
{
    //instantiate the database
    const db = DB.getInstance();
    //get all routes and stops that are proximal to the request
    let entryPoints = await getEntryPoints(request);
}