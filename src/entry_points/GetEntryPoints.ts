import DB from '../db/db'
import { checkProximity } from '../db/helpers';
import { Request } from '../db/types';
import { check_weight } from './CheckWeight';

// Definition of the entry point
// { routeId: { locationsAP: stop[], locationsAD: stop[]} }

export async function getEntryPoints(request: Request): Promise<Array<{}>> {
    const db = DB.getInstance();
    let entryPoints: Array<{}> = await checkProximity(request);

    // Use Promise.all to wait for all checks to complete for each item
    entryPoints = await Promise.all(entryPoints.map(async item => {
        const checks = [
            await check_weight(item, request),
            await check_volume(item, request),
            await check_distance(item, request),
            await check_time(item, request)
        ];
        // If all checks pass, return the item. Otherwise, return null.
        return checks.every(check => check) ? item : null;
    }));

    // Remove null items from the array
    entryPoints = entryPoints.filter(item => item !== null);

    return entryPoints;
}