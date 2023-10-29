import axios, { AxiosResponse, AxiosError } from 'axios';


interface GeoJSON {
    type: string;
    metadata: {
        attribution: string;
        service: string;
        timestamp: number;
        query: {
            coordinates: [number, number][];
            profile: string;
            format: string;
        };
        engine: {
            version: string;
            build_date: string;
            graph_date: string;
        };
    };
    features: Feature[];
    bbox: number[];
}

interface Feature {
    bbox: number[];
    type: string;
    properties: any; // Use the appropriate type here based on your data
    geometry: Geometry;
}

interface Geometry {
    coordinates: [number, number][];
    type: string;
}




const API_KEY: string | undefined = process.env.ORS_API_KEY;

if (!API_KEY) {
    console.error("API key not set in environment variables.");
    process.exit(1);
}

const startCoords = "8.681495,49.41461";
const endCoords = "8.687872,49.420318";
const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startCoords}&end=${endCoords}`;

axios.get(url, {
    headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
    }
})
.then((response: AxiosResponse<GeoJSON>) => {  // <-- Notice the generic type here
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Body:', response.data);

    // Accessing the coordinates of the first feature's geometry:
    const coordinates = response.data.features[0].geometry.coordinates;
    console.log('Coordinates:', coordinates);

})
.catch((error: AxiosError) => {
    if (error.response) {
        console.error('Data:', error.response.data);
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
    } else if (error.request) {
        console.error('No response received:', error.request);
    } else {
        console.error('Error:', error.message);
    }
});