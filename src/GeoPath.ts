import { GeoCheck } from "./GeoCheck";
import { Queue } from "./Queue";
import { Path } from "./PathFinder"
import { loadAndStorePath } from "./PathFinder"

type coord_t = [number, number]


function GeoCheckRoute(path: Path | undefined, newCoord:coord_t): boolean
{
    if (path !== undefined) {
        let route: coord_t[] = path.getGeoData();
        let index: number = 1;
        while (index < route.length)
        {
            if (GeoCheck(newCoord, route[index -1], route[index]))
            {
                return true;
            }
            index += 1;
        }
    } else {
        return false;
    }
    return false;
}

async function main()
{
    const queue = new Queue<Path>();
    
    await loadAndStorePath(queue, "8.681495,49.41461", "8.687872,49.420318");
    let path: Path | undefined = queue.dequeue();
    

    if (path !== undefined) {
        console.log(GeoCheckRoute(path, [8.681495,49.41461]));
    } else
    {
        console.log("path is NULL");
    }
}

main()
