import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';

const prisma = new PrismaClient();

export const getAllFacilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: 'asc' },
    });

    const edges = await prisma.facilityEdge.findMany({
      include: { sourceFacility: true, targetFacility: true },
    });

    res.json({
      success: true,
      data: {
        facilities,
        edges,
      },
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve facilities.' });
  }
};

export const navigateRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startFacilityId, destinationFacilityId, algorithm = 'BFS' } = req.body;

    if (!startFacilityId || !destinationFacilityId) {
      res.status(400).json({ success: false, message: 'Both start and destination facility IDs are required.' });
      return;
    }

    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    let result: any;
    if (algorithm === 'DIJKSTRA') {
      result = dsaService.facilityGraph.dijkstraShortestPath(startFacilityId, destinationFacilityId);
    } else {
      result = dsaService.facilityGraph.bfsShortestPath(startFacilityId, destinationFacilityId);
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error during facility navigation:', error);
    res.status(500).json({ success: false, message: error.message || 'Route calculation failed.' });
  }
};

export const exploreDfs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startId } = req.query;

    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    const facilities = dsaService.facilityGraph.getAllVertices();
    const startFacility = startId ? String(startId) : (facilities[0]?.id || '');

    const result = dsaService.facilityGraph.dfsExploration(startFacility);

    res.json({
      success: true,
      data: {
        algorithm: 'Depth-First Search (DFS)',
        startNode: facilities.find((f) => f.id === startFacility),
        explorationOrder: result.order,
        traceSteps: result.steps,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'DFS exploration failed.' });
  }
};
