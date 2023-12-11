import { getEntryPoints } from './GetEntryPoints';

describe('getEntryPoints', () => {
  it('should return entry points with applied filters', async () => {
    // Mock the dependencies and request object
    const checkProximityMock = jest.fn().mockResolvedValue(/* mock checkProximity output */);
    const applyFiltersByRouteMock = jest.fn().mockResolvedValue(/* mock filtered entry points */);
    const request = /* mock request object */;

    // Mock the DB.getInstance() method
    jest.mock('../db', () => ({
      getInstance: jest.fn().mockReturnValue({
        // Mock the checkProximity method
        checkProximity: checkProximityMock,
      }),
    }));

    // Call the getEntryPoints function
    const entryPoints = await getEntryPoints(request);

    // Assertions
    expect(checkProximityMock).toHaveBeenCalledWith(request);
    expect(applyFiltersByRouteMock).toHaveBeenCalledTimes(Object.keys(entryPoints).length);
    expect(entryPoints).toEqual(/* expected entry points with applied filters */);
  });
});