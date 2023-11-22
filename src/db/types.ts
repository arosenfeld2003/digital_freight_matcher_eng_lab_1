export interface Route {
  id: number
  truck_id: number
  max_time: number // max time for a route
  profitability: number
}

export interface Stop {
  id: number
  location_id: number
  drop_time: number // extra time necessary for a delivery - constant of 15 mins
  previous_stop_id: number
  next_stop_id: number
  route_id: number
}

export interface Location {
  id: number
  latitude: number
  longitude: number
}

export interface Request {
  id: number
  client_id: number
  route_id: number // could be null
  origin_stop_id: number
  destination_stop_id: number
  contract_type: string
}

export interface Package {
  id: number
  request_id: number
  packagetype_id: number
}

export interface Packagetype {
  id: number
  volume: number
  weight: number
  name: string // "default"
}

export interface Truck {
  id: number
  max_weight: number
  max_volume: number
  cpm: number // costs per mile
  avg_spd: number // average speed
  type: string
  autonomy: string
}

export interface Client {
  id: number
  company_name: string
  company_client_id: number
}
