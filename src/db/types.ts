export interface Route {
  id: number
  origin: string
  destination: string
  profitability: number
}

export interface Cargo {
  id: number
  truck_id: number
}

export interface Location {
  id: number
  latitude: number
  longitude: number
  client_id: number
}

export interface Request {
  id: number
  origin_location_id: number
  destination_location_id: number
  cargo_id: number
  route_id: number
  contract_type: string
}

export interface Parcel {
  id: number
  cargo_id: number
  volume: number
  weight: number
  type: string
}

export interface Truck {
  id: number
  autonomy: string
  capacity: number
  type: string
}

export interface Client {
  id: number
  company_name: string
  company_client_id: number
}
