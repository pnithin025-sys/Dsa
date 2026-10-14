/**
 * Binary Tree & Hierarchical Tree Structure
 * Models Hostel hierarchy: Hostel -> Blocks -> Floors -> Rooms -> Beds
 * Implements Tree Traversal algorithms: Preorder, Inorder, Postorder, and Level-order (BFS).
 */

export interface TreeNodeData {
  id: string;
  name: string;
  type: 'HOSTEL' | 'BLOCK' | 'FLOOR' | 'ROOM' | 'BED';
  capacity?: number;
  occupancy?: string;
  status?: string;
  meta?: any;
}

export class TreeNode {
  public data: TreeNodeData;
  public left: TreeNode | null;
  public right: TreeNode | null;
  public children: TreeNode[]; // Multi-way tree representation for full hostel layout

  constructor(data: TreeNodeData) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.children = [];
  }

  public addChild(child: TreeNode): void {
    this.children.push(child);
  }
}

export class HostelBinaryTree {
  public root: TreeNode | null = null;

  constructor(rootData?: TreeNodeData) {
    if (rootData) {
      this.root = new TreeNode(rootData);
    }
  }

  /**
   * Insert node as a Binary Search Tree node keyed by name / ID
   */
  public insertBST(data: TreeNodeData): void {
    const newNode = new TreeNode(data);
    if (!this.root) {
      this.root = newNode;
      return;
    }

    let current = this.root;
    while (true) {
      if (data.name.localeCompare(current.data.name) < 0) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  /**
   * Preorder Traversal: Root -> Left -> Right
   * Time Complexity: O(n)
   */
  public preorderTraversal(node: TreeNode | null = this.root, result: TreeNodeData[] = []): TreeNodeData[] {
    if (!node) return result;
    result.push(node.data);
    this.preorderTraversal(node.left, result);
    this.preorderTraversal(node.right, result);
    return result;
  }

  /**
   * Inorder Traversal: Left -> Root -> Right
   * Time Complexity: O(n)
   */
  public inorderTraversal(node: TreeNode | null = this.root, result: TreeNodeData[] = []): TreeNodeData[] {
    if (!node) return result;
    this.inorderTraversal(node.left, result);
    result.push(node.data);
    this.inorderTraversal(node.right, result);
    return result;
  }

  /**
   * Postorder Traversal: Left -> Right -> Root
   * Time Complexity: O(n)
   */
  public postorderTraversal(node: TreeNode | null = this.root, result: TreeNodeData[] = []): TreeNodeData[] {
    if (!node) return result;
    this.postorderTraversal(node.left, result);
    this.postorderTraversal(node.right, result);
    result.push(node.data);
    return result;
  }

  /**
   * Level Order Traversal (BFS queue-based)
   * Time Complexity: O(n)
   */
  public levelOrderTraversal(): TreeNodeData[] {
    if (!this.root) return [];
    const queue: TreeNode[] = [this.root];
    const result: TreeNodeData[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current.data);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return result;
  }

  /**
   * Search for a specific node by ID in tree: O(n) or O(h) in BST
   */
  public searchById(id: string, node: TreeNode | null = this.root): TreeNode | null {
    if (!node) return null;
    if (node.data.id === id || node.data.name === id) return node;

    // Search children if hierarchical
    for (const child of node.children) {
      const found = this.searchById(id, child);
      if (found) return found;
    }

    const leftSearch = this.searchById(id, node.left);
    if (leftSearch) return leftSearch;
    return this.searchById(id, node.right);
  }

  /**
   * Build complete hierarchical tree from DB blocks & rooms
   */
  public static buildHierarchicalTree(blocks: any[]): TreeNode {
    const root = new TreeNode({
      id: 'HOSTEL_ROOT',
      name: 'Smart Hostel Complex',
      type: 'HOSTEL',
      meta: { totalBlocks: blocks.length },
    });

    for (const block of blocks) {
      const blockNode = new TreeNode({
        id: block.id,
        name: block.name,
        type: 'BLOCK',
        meta: { genderType: block.genderType, totalFloors: block.totalFloors },
      });

      if (block.floors) {
        for (const floor of block.floors) {
          const floorNode = new TreeNode({
            id: floor.id,
            name: floor.name,
            type: 'FLOOR',
            meta: { floorNumber: floor.floorNumber },
          });

          if (floor.rooms) {
            for (const room of floor.rooms) {
              const roomNode = new TreeNode({
                id: room.id,
                name: `Room ${room.roomNumber}`,
                type: 'ROOM',
                capacity: room.capacity,
                occupancy: `${room.occupiedBeds}/${room.capacity}`,
                status: room.status,
                meta: { type: room.roomType, availableBeds: room.availableBeds },
              });

              if (room.beds) {
                for (const bed of room.beds) {
                  const bedNode = new TreeNode({
                    id: bed.id,
                    name: `Bed ${bed.bedNumber}`,
                    type: 'BED',
                    status: bed.isOccupied ? 'OCCUPIED' : 'VACANT',
                    meta: { student: bed.student?.name || 'Unoccupied' },
                  });
                  roomNode.addChild(bedNode);
                }
              }

              floorNode.addChild(roomNode);
            }
          }

          blockNode.addChild(floorNode);
        }
      }

      root.addChild(blockNode);
    }

    return root;
  }
}
