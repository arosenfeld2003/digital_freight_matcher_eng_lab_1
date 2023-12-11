import { getRouteById, getStopsByRequestId } from '@db/helpers';
import { EntryPoint } from '../db/types';
import { Request } from '../db/types';
import { Stop } from '../db/types';
import { getStopById } from '../db/helpers';
import { getDistanceByStop } from '@db/helpers';
import { Truck } from '@db/types';
import { getWeightbyRequestId } from '@db/helpers';
import { getVolumebyRequestId } from '@db/helpers';
import { getTruckByRouteId } from '@db/helpers';
import { getDistanceArr } from './DistanceMap';

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
    const [route, origin_stop, dest_stop, truck] = await Promise.all([
        getRouteById(routeId),
        getStopById(request.origin_stop_id),
        getStopById(request.destination_stop_id),
        getTruckByRouteId(routeId)
    ]);
    
    ///CALCULATE GROSS INCOME for **new** request ===============================================================
    const truck_utilization = await get_truck_utilization(truck, request);
    const km_traveled = await getDistanceByStop(dest_stop);
    const profit_margin = parseFloat(process.env.PROFIT_MARGIN ?? '0.5');
    const income_from_taking_request = truck_utilization * km_traveled  * (1 / 1.60934) * (1 + profit_margin);
    
    const pre_cost_profit = income_from_taking_request + route.profitability;

    ///Calculate max distance for request to be profitable =======================================================
    const effective_max = pre_cost_profit / (truck.cpm * (1 / 1.60934));

    ///create 2d number array of distances traveled
    const dis_arr = await getDistanceArr(routeId, entryPoint_arr, request);

    ///convert dis_arr to 2d boolean array where true means the stop is within the effective_max
    const boolean_arr = dis_arr.map((row) => row.map((value) => {return value <= effective_max;}));

    return boolean_arr;
}