"use client"

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  Controls,
  Background,
  ConnectionLineType,
  Position,
  useReactFlow,
  NodeTypes,
  Handle,
  Panel,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapProps {
  content: string;
}

// Define node data interface
interface NodeData {
  label: string;
  subtopics?: string[];
  nodeBgColor: string;
  textColor: string;
}

// Custom node component to render subtopics
const MindMapNode = ({ data }: { data: NodeData }) => {
  return (
    <div className="rounded-lg shadow-md p-2" style={{ backgroundColor: data.nodeBgColor, width: '100%', height: '100%' }}>
      <div className="font-semibold text-center" style={{ color: data.textColor }}>
        {data.label}
      </div>
      
      {data.subtopics && data.subtopics.length > 0 && (
        <div className="mt-2 p-2 text-xs rounded" style={{ backgroundColor: `${data.nodeBgColor}50`, maxHeight: 120, overflowY: 'auto' }}>
          <ul className="list-disc pl-4">
            {data.subtopics.map((topic, i) => (
              <li key={i} className="mb-1 text-left" style={{ color: data.textColor }}>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// Custom node types
const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNode,
};

// Define a set of colors for different branches
const branchColors = [
  { bg: '#ff7373', text: '#fff' }, // Red
  { bg: '#7986cb', text: '#fff' }, // Indigo  
  { bg: '#4db6ac', text: '#fff' }, // Teal
  { bg: '#ffb74d', text: '#333' }, // Orange
  { bg: '#ba68c8', text: '#fff' }, // Purple
  { bg: '#4fc3f7', text: '#333' }, // Light Blue
  { bg: '#aed581', text: '#333' }, // Light Green
  { bg: '#f06292', text: '#fff' }  // Pink
];

// Main wrapper component that includes the provider
const ReactFlowMindMap = ({ content }: MindMapProps) => {
  return (
    <ReactFlowProvider>
      <MindMapContent content={content} />
    </ReactFlowProvider>
  );
};

// Inner component that uses ReactFlow hooks
const MindMapContent = ({ content }: MindMapProps) => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [initialLayoutDone, setInitialLayoutDone] = useState(false);
  const { fitView } = useReactFlow();

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Parse mind map content and generate nodes and edges
  useEffect(() => {
    if (!content) return;
    
    try {
      const lines = content.split('\n').filter(line => line.trim());
      const nodes: Node<NodeData>[] = [];
      const edges: Edge[] = [];
      
      // Find the central topic - expected to be marked with #
      let centralTopic = "";
      const centralTopicLine = lines.find(line => line.trim().startsWith('#'));
      
      if (centralTopicLine) {
        centralTopic = centralTopicLine.replace('#', '').trim();
      } else if (lines.length > 0) {
        // Fallback to first line if no # is found
        centralTopic = lines[0].replace(/^[-*•#]/g, '').trim();
      } else {
        throw new Error("No content found for mind map");
      }
      
      // Add central node
      const rootNode: Node<NodeData> = {
        id: 'root',
        type: 'mindMapNode',
        data: {
          label: centralTopic,
          nodeBgColor: '#ff7373',
          textColor: '#ffffff'
        },
        position: { x: 0, y: 0 },
        style: { width: 180, height: 'auto' }
      };
      
      nodes.push(rootNode);
      
      let currentMainBranch: string | null = null;
      let centralTopicFound = false;
      let branchCount = 0;
      
      // Process the remaining lines to find main branches and subtopics
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Skip until we find the central topic
        if (!centralTopicFound) {
          if (line.startsWith('#')) {
            centralTopicFound = true;
          }
          continue;
        }
        
        // Check if this is a main branch (starting with -)
        const isMainBranch = line.startsWith('-');
        
        if (isMainBranch) {
          const branchText = line.replace(/^[-]/g, '').trim();
          
          // Skip if the line is too long to be a branch name
          if (branchText.length > 50) continue;
          
          branchCount++;
          const branchId = `branch-${branchCount}`;
          currentMainBranch = branchId;
          
          // Get color for this branch
          const colorIndex = (branchCount - 1) % branchColors.length;
          const branchColor = branchColors[colorIndex];
          
          // Add branch node
          const branchNode: Node<NodeData> = {
            id: branchId,
            type: 'mindMapNode',
            data: {
              label: branchText,
              subtopics: [],
              nodeBgColor: branchColor.bg,
              textColor: branchColor.text
            },
            position: { x: 0, y: 0 }, // Will be positioned by layout algorithm
            style: { width: 160, height: 'auto' }
          };
          
          nodes.push(branchNode);
          
          // Add edge from root to branch
          const edge: Edge = {
            id: `edge-root-${branchId}`,
            source: 'root',
            target: branchId,
            type: 'smoothstep',
            animated: false,
            style: { stroke: branchColor.bg, strokeWidth: 2 }
          };
          
          edges.push(edge);
          
        } else if (currentMainBranch && (line.startsWith('*') || line.includes('•'))) {
          // This is a subtopic of the current main branch (starting with * or •)
          const subtopicText = line.replace(/^[\s]*[\*•]/g, '').trim();
          
          // Skip if empty or too long
          if (!subtopicText || subtopicText.length > 50) continue;
          
          // Find the current branch node and add the subtopic
          const branchNode = nodes.find(node => node.id === currentMainBranch);
          if (branchNode && branchNode.data.subtopics) {
            branchNode.data.subtopics.push(subtopicText);
          }
        }
      }
      
      // Apply layout
      setNodes(nodes);
      setEdges(edges);
      setInitialLayoutDone(false);
      
    } catch (error) {
      console.error('Error parsing mind map content:', error);
      setNodes([]);
      setEdges([]);
    }
  }, [content]);
  
  // Apply auto-layout after nodes and edges are created
  useEffect(() => {
    if (nodes.length > 0 && edges.length > 0 && !initialLayoutDone) {
      // Simple radial layout algorithm
      const rootNode = nodes.find(n => n.id === 'root');
      if (!rootNode) return;
      
      // Exclude root node
      const branches = nodes.filter(n => n.id !== 'root');
      
      // Calculate positions in a circle around the root
      const radius = Math.max(250, 100 + (branches.length * 25));
      const angleStep = (2 * Math.PI) / branches.length;
      
      const updatedNodes = nodes.map(node => {
        if (node.id === 'root') {
          // Center the root node
          return {
            ...node,
            position: { x: 0, y: 0 }
          };
        } else {
          // Get the index of this branch
          const index = branches.findIndex(b => b.id === node.id);
          if (index === -1) return node;
          
          // Calculate position in circle
          const angle = angleStep * index;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          return {
            ...node,
            position: { x, y }
          };
        }
      });
      
      setNodes(updatedNodes);
      setInitialLayoutDone(true);
      
      // Fit view after a short delay
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 100);
    }
  }, [nodes, edges, initialLayoutDone, fitView]);

  return (
    <div className="w-full h-[600px] rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background color="#f8f8f8" gap={16} />
        <Panel position="top-right" className="bg-white rounded-md shadow-md p-2 m-1">
          <div className="text-xs font-medium text-gray-500">
            Puedes arrastrar los nodos y hacer zoom con la rueda del ratón
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default ReactFlowMindMap; 