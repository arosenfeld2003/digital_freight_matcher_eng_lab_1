/*
* Rough outline of cargoService...
* the goal is to check if specific parcel will fit in the cargo...
* this means total weight needs to be less than capacity of the truck.
* */

import { Parcel, Truck, Cargo } from '@db/types'; // Assuming you have a file where these interfaces are exported
import { getTruckByCargoId, getParcelsByCargoId } from './dbService'; // You'll need to create these functions

export class CargoService {
	// Check if a parcel can be safely added to a cargo
	public async canAddParcelToCargo(parcel: Parcel, cargoId: number): Promise<boolean> {
		const truck = await this.getTruckForCargo(cargoId);
		if (!truck) {
			throw new Error('Truck not found for the given cargo ID');
		}

		const currentParcels = await this.getParcelsForCargo(cargoId);
		const totalWeight = this.getTotalWeight(currentParcels) + parcel.weight;

		return totalWeight <= truck.capacity;
	}

	// Get the truck associated with a cargo
	private async getTruckForCargo(cargoId: number): Promise<Truck | null> {
		// Implement database logic to retrieve truck based on cargoId
		return getTruckByCargoId(cargoId);
	}

	// Get all parcels for a given cargo
	private async getParcelsForCargo(cargoId: number): Promise<Parcel[]> {
		// Implement database logic to retrieve parcels based on cargoId
		return getParcelsByCargoId(cargoId);
	}

	// Calculate the total weight of parcels
	private getTotalWeight(parcels: Parcel[]): number {
		return parcels.reduce((total, parcel) => total + parcel.weight, 0);
	}
}

// Example usage
// const cargoService = new CargoService();
// const canAdd = await cargoService.canAddParcelToCargo(newParcel, cargoId);
