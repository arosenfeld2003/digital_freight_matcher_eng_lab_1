import { getStopsByRequestId } from '@db/helpers';
import { EntryPoint } from '../db/types';
import { Request } from '../db/types';
import { Stop } from '../db/types';
import { getStopById } from '../db/helpers';
import { getDistanceByStop } from '@db/helpers';
import { Truck } from '@db/types';
import { getWeightbyRequestId } from '@db/helpers';
import { getVolumebyRequestId } from '@db/helpers';

async function get_truck_utilization(truck: Truck, request: Request): number
{
    const [request_weight, request_volume] = await Promise.all([
        getWeightbyRequestId(request.id),
        getVolumebyRequestId(request.id)
    ]);

    const truck_utilization = Math.max(request_weight / truck.max_weight, request_volume / truck.max_volume);
    return truck_utilization;
}

export async function checkProfit(routeId: number, entryPoint_arr: EntryPoint[], request: Request): Promise<boolean[][]>
{
    const [origin_stop, dest_stop] = await Promise.all([
        getStopById(request.origin_stop_id),
        getStopById(request.destination_stop_id)
    ]);
    
    ///CALCULATE GROSS INCOME for request ===============================================================
    const truck_utilization = await get_truck_utilization(routeId, request);
    const km_traveled = await getDistanceByStop(dest_stop);
    


    /*    
    const truck_max_weight = await getTruckMaxWeightByRouteId(routeId);
    const truck_max_volume = await getTruckMaxVolumeByRouteId(routeId);

    const request_weight = await getWeightbyRequestId(request.id);
    const request_volume = await getVolumebyRequestId(request.id);
    */

    //env variable used to agree km to miles conversion
    const gross_income = truck_utilization * km_traveled * cost_per_mile * (1 / 1.60934);
    //return not impolemnted
    return [];
}