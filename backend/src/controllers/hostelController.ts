import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { DSAService } from '../services/dsaService';
import { HostelBinaryTree, TreeNodeData } from '../dsa/BinaryTree';

const prisma = new PrismaClient();

export const getHostelStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const blocks = await prisma.hostelBlock.findMany({
      include: {
        floors: {
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    student: {
                      select: { id: true, studentId: true, name: true, department: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const hierarchicalTree = HostelBinaryTree.buildHierarchicalTree(blocks);

    // Build binary search tree projection of all rooms for traversal demo
    const bst = new HostelBinaryTree();
    for (const block of blocks) {
      for (const floor of block.floors) {
        for (const room of floor.rooms) {
          bst.insertBST({
            id: room.id,
            name: room.roomNumber,
            type: 'ROOM',
            capacity: room.capacity,
            occupancy: `${room.occupiedBeds}/${room.capacity}`,
            status: room.status,
            meta: { block: block.name, floor: floor.name, type: room.roomType },
          });
        }
      }
    }

    const preorder = bst.preorderTraversal();
    const inorder = bst.inorderTraversal();
    const postorder = bst.postorderTraversal();
    const levelOrder = bst.levelOrderTraversal();

    res.json({
      success: true,
      data: {
        blocks,
        hierarchicalTree,
        traversals: {
          preorder: {
            order: preorder,
            formula: 'Root → Left Subtree → Right Subtree',
            complexity: 'O(n) Time, O(h) Space',
          },
          inorder: {
            order: inorder,
            formula: 'Left Subtree → Root → Right Subtree (Sorted Key Order in BST)',
            complexity: 'O(n) Time, O(h) Space',
          },
          postorder: {
            order: postorder,
            formula: 'Left Subtree → Right Subtree → Root (Bottom-up teardown)',
            complexity: 'O(n) Time, O(h) Space',
          },
          levelOrder: {
            order: levelOrder,
            formula: 'Breadth-First Queue: Level 0 → Level 1 → Level 2...',
            complexity: 'O(n) Time, O(w) Space (w = max width)',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching hostel structure:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve hostel hierarchy.' });
  }
};
