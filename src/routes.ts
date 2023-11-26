export type StopNode = {
	id: number;
	request_id: number;
	location_id: number;
	drop_time: number;
	previous_stop_id: number | null;
	next_stop_id: number | null;
	route_id: number;
};

export type RouteLinkedList = {
	id: number;
	stops: Map<number, StopNode>; // Keyed by stop ID for easy access
};

export type Routes = {
	[key: number]: RouteLinkedList; // Keyed by route ID
};
