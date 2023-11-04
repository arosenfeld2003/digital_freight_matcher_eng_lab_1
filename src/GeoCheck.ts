import * as turf from '@turf/turf';

type coord = [number, number]


function isWithinDistance(distanceToPoint: number): boolean {
    const maxDistance = 1;
    if (distanceToPoint <= maxDistance ) {
        return true;
    } else {
        return false;
    }
}

function GeoCheck(newcoord: coord, startCoord: coord, endCoord: coord ): boolean  
{   
    const coordToCheck = turf.point(newcoord);
    const start = turf.point(startCoord);
    const end = turf.point(endCoord);
    const lineSegment = turf.lineString([start.geometry.coordinates, end.geometry.coordinates]);
    const nearestPointOnLine = turf.nearestPointOnLine(lineSegment, coordToCheck);
    const distanceToPoint = turf.distance(coordToCheck, nearestPointOnLine, { units: 'kilometers' }); 
    const result = isWithinDistance(distanceToPoint);
    return result;
}