import { GeoCheck } from "./GeoCheck";
import { Queue } from "./Queue";
import { Path } from "./PathFinder"
import { loadAndStorePath } from "./PathFinder"
import * as turf from '@turf/turf';
import { FeatureCollection, Point,Feature, featureCollection, point } from '@turf/helpers';

type coord_t = [number, number]
interface Coord {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties?: any;
  }

function GeoCheckRoute(path: Path | undefined, newCoord:coord_t): boolean {
    if (path !== undefined) {
        let route: coord_t[] = path.getGeoData();
        let index: number = 1;
        while (index < route.length) {
            if (GeoCheck(newCoord, route[index -1], route[index])) {
                return true;
            }
            index += 1;
        }
    } else {
        return false;
    }
    return false;
}


function GeoCheckLine(queue: Queue<coord_t>, newCoord:coord_t,  startCoord: coord_t, endCoord: coord_t) {
    console.log("is coordinate within bound ? ");
    if (GeoCheck(newCoord, startCoord , endCoord)) {
        console.log("TRUE");
        queue.enqueue(newCoord);
    } else
    {
        console.log("FALSE");
    }
}

function buildFeatureCollection(queue: Queue<coord_t>): FeatureCollection<Point> {
    let pointFeatures = [];
    while (!queue.isEmpty()) {
        let coord = queue.dequeue();
        if (coord) {
          let pointFeature = turf.point(coord);
          pointFeatures.push(pointFeature);
        }
    }
    let points = turf.featureCollection(pointFeatures);
    return points;
}


function OrganiseRoute(pointsFeat:FeatureCollection<Point>, startCoord: coord_t, endCoord: coord_t) {

    let lastCoord = turf.point(startCoord);
    let newroute: coord_t[] = [];
    var nearest: Feature <Point>;
    let newCoord: coord_t;

    while (pointsFeat.features.length > 0) {
        nearest = turf.nearestPoint(lastCoord, pointsFeat);
        newCoord = nearest.geometry.coordinates as coord_t;
        newroute.push(newCoord);
        pointsFeat.features = pointsFeat.features.filter(
            (feature) => feature.geometry.coordinates[0] !== newCoord[0] || feature.geometry.coordinates[1] !== newCoord[1]
        );
        lastCoord = turf.point(newCoord);
    }
    newroute.push(endCoord);
    console.log("Sorted array of coordinates:");
    console.log(newroute);
}


// async function BuildRoute(queue: Queue<coord_t>, startCoord: coord_t, endCoord: coord_t) {
//     let newRoute: coord_t[];
//     let currRoute = new Path();
//     let last: coord_t = startCoord;
//     while (!queue.isEmpty()) {
//         await currRoute.setPathInfoDiagnostic("8.681495,49.41461", "8.687872,49.420318");
//         currRoute.getGeoData()
//     }
// }


// async function main() {
//     const queue = new Queue<Path>();

//     await loadAndStorePath(queue, "8.681495,49.41461", "8.687872,49.420318");
//     let path: Path | undefined = queue.dequeue();

//     if (path !== undefined) {
//         console.log(GeoCheckRoute(path, [8.681495,49.41461]));
//     } else
//     {
//         console.log("path is NULL");
//     }
// }|


async function main()
{
    const queue = new Queue<coord_t>();
    GeoCheckLine(queue , [35.7544138157923, -84.3875298776527], [33.7544138157922, -84.3875298776525], [34.9161210050057, -84.3875298776525]);
    GeoCheckLine(queue , [33.7544138157923, -84.3875298776527], [33.7544138157922, -84.3875298776525], [34.9161210050057, -84.3875298776525]);
    GeoCheckLine(queue , [33.7544138157923, -84.3875298776525], [33.7544138157922, -84.3875298776525], [34.9161210050057, -84.3875298776525]);
    GeoCheckLine(queue , [33.7544138157923, -84.3875298776526], [33.7544138157922, -84.3875298776525], [34.9161210050057, -84.3875298776525]);
    console.log("Coordinate in queue waiting to be processed as turf point collection:");
    console.log(queue);
    console.log("Creating turf Feature collection:");
    var result:FeatureCollection<Point> =  buildFeatureCollection(queue);
    console.log(result);
    OrganiseRoute(result, [33.7544138157922, -84.3875298776525], [34.9161210050057, -84.3875298776525]);
}


main()
