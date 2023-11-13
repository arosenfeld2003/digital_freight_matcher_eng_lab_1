const turf = require('@turf/turf');

type coord_t = [number, number]; // Define the coordinate type as a tuple of latitude and longitude.

// Function to calculate the distance for the segment that differs between the two paths.
function calculateDistanceForDifferingSegment(path1: coord_t[], path2: coord_t[]): number {
    // Assuming path2 has the extra coordinate, find where the paths diverge.
    let divergeIndex = 0;
    while (divergeIndex < path1.length && JSON.stringify(path1[divergeIndex]) === JSON.stringify(path2[divergeIndex])) {
        divergeIndex++;
    }

    // Calculate the distance from the divergence point to the next point on path2 (which is the extra coordinate).
    const from = turf.point(path2[divergeIndex]);
    const to = turf.point(path2[divergeIndex + 1]);
    const options = { units: 'miles' };
    return turf.distance(from, to, options); //Distance is returned in miles.
}

// Function to calculate the price difference between two paths considering one has an extra coordinate.
function calculatePriceDifferenceWithExtraCoord(path1: coord_t[], path2: coord_t[], costPerMile: number): number {
    // Find out which path is longer to determine which one potentially has the extra coordinate.
    const isPath2Longer = path2.length > path1.length;
    const differingSegmentDistance = isPath2Longer
        ? calculateDistanceForDifferingSegment(path1, path2)
        : calculateDistanceForDifferingSegment(path2, path1);

    // Calculate the cost for the differing segment.
    const extraCost = differingSegmentDistance * costPerMile;

    return extraCost; // Return the cost for the extra segment.
}

// Function to calculate the total distance for a path using Turf.js.
function universalCalculateTotalDistance(path: coord_t[]): number {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const from = turf.point(path[i]);
        const to = turf.point(path[i + 1]);
        const options = { units: 'miles' }; // Turf.js can calculate distance in miles directly.
        totalDistance += turf.distance(from, to, options);
    }
    return totalDistance; // The distance is returned in miles.
}

// Function to calculate the price difference between two paths.
function universalCalculatePriceDifference(path1: coord_t[], path2: coord_t[], costPerMile: number): number {
    const totalDistancePath1 = universalCalculateTotalDistance(path1);
    const totalDistancePath2 = universalCalculateTotalDistance(path2);

    return Math.abs(totalDistancePath1 - totalDistancePath2) * costPerMile; // Return the absolute price difference.
}

// Example usage:
const costPerMile = 0.5; // Example cost per mile.
// Sample coordinates for path1. Path2 has one extra coordinate.
const path1: coord_t[] = [[0, 0], [0, 1], [1, 1], [1, 2]]; 
const path2: coord_t[] = [[0, 0], [0, 1], [0.5, 1.5], [1, 1], [1, 2]]; 

const priceDifference = calculatePriceDifferenceWithExtraCoord(path1, path2, costPerMile);
console.log(`The additional cost for the extra coordinate in path2 is: $${priceDifference}`);
