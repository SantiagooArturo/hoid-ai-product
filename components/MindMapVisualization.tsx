"use client"

import React, { useEffect, useState, useRef } from 'react'

interface MindMapNode {
  id: string
  text: string
  color: string
  childNodes: MindMapNode[]
  parentId?: string
  subtopics?: string[]
}

interface MindMapVisualizationProps {
  content: string
}

// Define a set of pastel colors for different branches
const branchColors = [
  '#ff9f9f', // Red
  '#7986cb', // Indigo
  '#4db6ac', // Teal
  '#ffb74d', // Orange
  '#ba68c8', // Purple
  '#4fc3f7', // Light Blue
  '#aed581', // Light Green
  '#f06292'  // Pink
]

// Parse the mind map content into a structured format
const parseMindMapContent = (content: string): MindMapNode | null => {
  try {
    console.log("Content received for parsing:", content);
    
    // Verify we have non-empty content
    if (!content || content.trim().length === 0) {
      console.error("Received empty content for mind map");
      return null;
    }
    
    const lines = content.split('\n').filter(line => line.trim())
    console.log("Lines after splitting:", lines);
    
    // Find the central topic - expected to be marked with #
    let centralTopic = ""
    const centralTopicLine = lines.find(line => line.trim().startsWith('#'))
    
    if (centralTopicLine) {
      centralTopic = centralTopicLine.replace('#', '').trim()
    } else if (lines.length > 0) {
      // Fallback to first line if no # is found
      centralTopic = lines[0].replace(/^[-*•#]/g, '').trim()
    } else {
      console.error("No content found for mind map");
      return null;
    }
    
    console.log("Central topic:", centralTopic);
    
    const rootNode: MindMapNode = {
      id: 'root',
      text: centralTopic,
      color: '#ff7373', // Central topic color (deeper red)
      childNodes: []
    }
    
    let currentMainBranch: MindMapNode | null = null
    let centralTopicFound = false
    
    // Process the remaining lines to find main branches and subtopics
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      // Skip until we find the central topic
      if (!centralTopicFound) {
        if (line.startsWith('#')) {
          centralTopicFound = true
        }
        continue
      }
      
      // Check if this is a main branch (starting with -)
      const isMainBranch = line.startsWith('-') 
      
      if (isMainBranch) {
        const branchText = line.replace(/^[-]/g, '').trim()
        
        // Skip if the line is too long to be a branch name
        if (branchText.length > 50) continue
        
        // Create a new main branch
        currentMainBranch = {
          id: `branch-${rootNode.childNodes.length}`,
          text: branchText,
          color: branchColors[rootNode.childNodes.length % branchColors.length],
          childNodes: [],
          parentId: 'root',
          subtopics: []
        }
        
        rootNode.childNodes.push(currentMainBranch)
        console.log("Added main branch:", branchText);
      } else if (currentMainBranch && (line.startsWith('*') || line.includes('•'))) {
        // This is a subtopic of the current main branch (starting with * or •)
        const subtopicText = line.replace(/^[\s]*[\*•]/g, '').trim()
        
        // Skip if empty or too long
        if (!subtopicText || subtopicText.length > 50) continue
        
        // Add as subtopic
        if (currentMainBranch.subtopics) {
          currentMainBranch.subtopics.push(subtopicText)
          console.log("Added subtopic to", currentMainBranch.text, ":", subtopicText);
        }
      }
    }
    
    // Display debug info if no branches were found
    if (rootNode.childNodes.length === 0) {
      console.error("No branches were parsed from the content");
      return null;
    }
    
    console.log("Final mind map structure:", rootNode);
    return rootNode;
  } catch (error) {
    console.error('Error parsing mind map content:', error)
    return null
  }
}

export default function MindMapVisualization({ content }: MindMapVisualizationProps) {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null)
  const [parseError, setParseError] = useState<boolean>(false)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Function to handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2.5));
  };
  
  // Function to handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Function to reset zoom and position
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoomLevel > 1) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && zoomLevel > 1 && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      
      setPosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Reset position when zoom level returns to 1
  useEffect(() => {
    if (zoomLevel <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);
  
  useEffect(() => {
    const parsedMap = parseMindMapContent(content)
    if (parsedMap) {
      setMindMap(parsedMap)
      setParseError(false)
    } else {
      setParseError(true)
    }
  }, [content])
  
  // Draw connections between nodes after they've been positioned
  useEffect(() => {
    if (!mindMap) return
    
    // Wait for DOM to update with nodes
    const timer = setTimeout(() => {
      drawConnections()
      
      // Add event listener for window resize
      window.addEventListener('resize', drawConnections)
      
      return () => {
        window.removeEventListener('resize', drawConnections)
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [mindMap, zoomLevel])  // Also redraw connections when zoom changes
  
  // Function to draw a path between two elements - simplified to always highlight
  const drawPath = (from: HTMLDivElement, to: HTMLDivElement, color: string, thickness: number = 2) => {
    if (!svgRef.current || !containerRef.current) return
    
    const fromRect = from.getBoundingClientRect()
    const toRect = to.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calculate center points relative to the SVG
    const fromX = (fromRect.left + fromRect.width / 2) - containerRect.left
    const fromY = (fromRect.top + fromRect.height / 2) - containerRect.top
    const toX = (toRect.left + toRect.width / 2) - containerRect.left
    const toY = (toRect.top + toRect.height / 2) - containerRect.top
    
    // Create path element
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    
    // Create a curved path
    const dx = toX - fromX
    const dy = toY - fromY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Control point calculation - more curve for longer distances
    const curveFactor = Math.min(0.3, 30 / distance)
    const cpx = fromX + dx / 2 - dy * curveFactor
    const cpy = fromY + dy / 2 + dx * curveFactor
    
    const pathData = `M ${fromX},${fromY} Q ${cpx},${cpy} ${toX},${toY}`
    
    path.setAttribute('d', pathData)
    path.setAttribute('stroke', color)
    path.setAttribute('stroke-width', thickness.toString())
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke-opacity', '0.85')
    
    // Add some animation
    path.setAttribute('stroke-dasharray', '0, 1000')
    path.innerHTML = `
      <animate 
        attributeName="stroke-dasharray" 
        values="0,1000;${distance},0" 
        dur="0.5s" 
        fill="freeze" 
        calcMode="spline"
        keySplines="0.4 0 0.2 1"
      />
    `
    
    svgRef.current.appendChild(path)
  }
  
  // Draw connections from root to main branches - simplified version
  const drawConnections = () => {
    if (!svgRef.current || !mindMap) return
    
    // Clear existing paths
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild)
    }
    
    // Draw connections from root to main branches
    const rootNode = nodeRefs.current['root']
    if (rootNode) {
      mindMap.childNodes.forEach(branch => {
        const branchNode = nodeRefs.current[branch.id]
        if (branchNode) {
          drawPath(rootNode, branchNode, branch.color, 2)
          
          // Draw connections from branch to its children
          branch.childNodes.forEach(subBranch => {
            const subBranchNode = nodeRefs.current[subBranch.id]
            if (subBranchNode) {
              drawPath(branchNode, subBranchNode, branch.color, 1.5)
            }
          })
        }
      })
    }
  }
  
  if (parseError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-red-500 font-medium mb-2">
          No se pudo visualizar el mapa mental
        </p>
        <p className="text-gray-600 text-sm mb-4">
          El formato recibido no es compatible con la visualización.
        </p>
        <details className="text-left w-full text-xs text-gray-500 border p-2 rounded">
          <summary className="cursor-pointer">Ver contenido recibido</summary>
          <pre className="mt-2 overflow-auto p-2 bg-gray-100 rounded">{content}</pre>
        </details>
      </div>
    )
  }
  
  if (!mindMap) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Analizando el contenido del mapa mental...</p>
      </div>
    )
  }
  
  // Calculate positions for each node
  const NodeComponent = ({ node, depth = 0, index = 0, totalSiblings = 1 }: 
    { node: MindMapNode, depth?: number, index?: number, totalSiblings?: number }) => {
    
    const isRoot = depth === 0
    const isMainBranch = depth === 1
    
    // Position calculation
    let positionStyle: React.CSSProperties = { position: 'absolute' }
    
    if (isRoot) {
      positionStyle = {
        ...positionStyle,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }
    } else if (isMainBranch) {
      // Position main branches in a circle around the center
      const angleStep = 360 / totalSiblings
      // Adjust the starting angle based on number of siblings to ensure a balanced layout
      const startAngle = totalSiblings <= 2 ? 0 : 15
      const angle = (index * angleStep + startAngle) % 360
      
      // Adjust radius based on number of branches to create more space
      const radius = Math.min(180, 120 + (totalSiblings * 5)) 
      
      // Convert angle to radians
      const radians = (angle * Math.PI) / 180
      
      // Calculate x and y positions based on angle and radius
      const x = Math.cos(radians) * radius
      const y = Math.sin(radians) * radius
      
      positionStyle = {
        ...positionStyle,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)'
      }
    } else {
      // For sub-branches, if there's only one, place it below the parent
      // Otherwise, spread them around the parent
      let x = 0;
      let y = 0;
      
      if (totalSiblings === 1) {
        // Place single sub-branch below the parent
        x = 0;
        y = 100;
      } else {
        // Sub-branches spread out from their parent in a semicircle on the outer side
        // The range is 120 degrees, centered away from the center of the map
        const parentNode = nodeRefs.current[node.parentId || ''];
        const rootNode = nodeRefs.current['root'];
        
        if (parentNode && rootNode) {
          // Calculate base angle based on parent's position relative to center
          const parentRect = parentNode.getBoundingClientRect();
          const rootRect = rootNode.getBoundingClientRect();
          
          const dx = parentRect.left - rootRect.left;
          const dy = parentRect.top - rootRect.top;
          
          // Base angle points away from center
          let baseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          
          // Adjust the angle range based on number of siblings
          const angleRange = Math.min(180, 60 + totalSiblings * 20);
          const startAngle = baseAngle - angleRange / 2;
          const stepAngle = angleRange / (totalSiblings - 1 || 1);
          const angle = startAngle + index * stepAngle;
          
          // Convert angle to radians
          const radians = (angle * Math.PI) / 180;
          
          // Calculate position
          const subRadius = 90 + (totalSiblings * 5); // Distance from parent
          x = Math.cos(radians) * subRadius;
          y = Math.sin(radians) * subRadius;
        } else {
          // Fallback if parent node reference is not available
          const angleStep = 120 / (totalSiblings - 1 || 1);
          const startAngle = -60; // Start 60 degrees to the left
          const angle = startAngle + (index * angleStep);
          
          // Convert angle to radians  
          const radians = (angle * Math.PI) / 180;
          
          // Calculate position
          const subRadius = 90; // Distance from parent
          x = Math.cos(radians) * subRadius;
          y = Math.sin(radians) * subRadius;
        }
      }
      
      positionStyle = {
        ...positionStyle,
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }
    }
    
    // Node styling based on depth - always styled as active
    let nodeStyles: React.CSSProperties = {
      backgroundColor: node.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      boxShadow: `0 2px 6px rgba(0,0,0,0.15)`,
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255,255,255,0.8)',
      padding: '0.5rem',
      zIndex: 20 - depth
    }
    
    // Text styles
    let textStyles: React.CSSProperties = {
      textAlign: 'center',
      fontWeight: 600,
      fontSize: isRoot ? '1rem' : isMainBranch ? '0.875rem' : '0.75rem',
      lineHeight: '1.2',
      color: '#333',
      maxWidth: '90%',
      wordBreak: 'break-word'
    }
    
    // Size based on depth
    if (isRoot) {
      nodeStyles = {
        ...nodeStyles,
        width: '110px',
        height: '110px'
      }
    } else if (isMainBranch) {
      nodeStyles = {
        ...nodeStyles,
        width: '90px',
        height: '90px'
      }
    } else {
      nodeStyles = {
        ...nodeStyles,
        width: '75px',
        height: '75px'
      }
    }
    
    // Render subtopics next to branch nodes
    const renderSubtopics = () => {
      if (!node.subtopics || node.subtopics.length === 0) return null
      
      // Determine position based on quadrant
      let subtopicPosition = 'right';
      
      if (isMainBranch && positionStyle.left && positionStyle.top) {
        const leftPos = positionStyle.left.toString();
        
        // If node is on the left side of the mind map, show the subtopics on the left
        if (leftPos.includes('calc(50% - ') || leftPos.includes('calc(50% +') && parseInt(leftPos.match(/-?\d+/)?.[0] || '0') < 0) {
          subtopicPosition = 'left';
        }
      }
      
      // Style based on position
      const positionClass = subtopicPosition === 'left' 
        ? 'right-full mr-2 top-0 text-right' 
        : 'left-full ml-2 top-0 text-left';
      
      // Adjust the list style based on position
      const listStyle = subtopicPosition === 'left'
        ? 'list-disc pr-4 pl-0 text-xs space-y-1'
        : 'list-disc pl-4 text-xs space-y-1';
      
      return (
        <div 
          className={`absolute ${positionClass} bg-white rounded-md p-2 shadow-md border text-xs`}
          style={{ 
            backgroundColor: `${node.color}22`, // Very light version of node color
            borderColor: node.color,
            maxWidth: '150px',
            zIndex: 15 - depth
          }}
        >
          <ul className={listStyle}>
            {node.subtopics.map((topic, i) => (
              <li key={i} className="mb-1">{topic}</li>
            ))}
          </ul>
        </div>
      )
    }
    
    return (
      <>
        <div 
          ref={(el: HTMLDivElement | null) => { nodeRefs.current[node.id] = el }}
          style={{ ...positionStyle, ...nodeStyles }}
          className="cursor-default"
        >
          <div style={textStyles}>
            {node.text}
          </div>
          
          {renderSubtopics()}
        </div>
        
        {/* Render child nodes */}
        {node.childNodes.map((child, i) => (
          <NodeComponent 
            key={child.id}
            node={child} 
            depth={depth + 1} 
            index={i} 
            totalSiblings={node.childNodes.length} 
          />
        ))}
      </>
    )
  }
  
  return (
    <div className="relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-50 bg-white bg-opacity-80 p-1 rounded-md shadow-sm">
        <button 
          onClick={handleZoomOut}
          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
          title="Reducir zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <span className="text-xs font-medium">{Math.round(zoomLevel * 100)}%</span>
        <button 
          onClick={handleZoomIn}
          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100"
          title="Aumentar zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button 
          onClick={handleResetZoom}
          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 ml-1"
          title="Restablecer zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
            <path d="M3 12h3"></path>
            <path d="M18 12h3"></path>
          </svg>
        </button>
      </div>
      
      {/* Helper message when zoomed in */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-50 bg-white bg-opacity-80 px-3 py-1 rounded-full shadow-sm text-xs font-medium text-gray-600">
          {isDragging ? 'Moviendo...' : 'Arrastrar para mover'}
        </div>
      )}
    
      <div 
        ref={containerRef} 
        className="relative w-full h-[550px] bg-white border border-gray-100 rounded-lg overflow-hidden shadow-md"
        style={{ 
          cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className="absolute inset-0"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`, 
            transformOrigin: 'center center', 
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* SVG layer for connections */}
          <svg 
            ref={svgRef}
            className="absolute inset-0 w-full h-full z-10" 
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Nodes layer - center it and add more padding */}
          <div className="relative w-full h-full p-8">
            <NodeComponent node={mindMap} />
          </div>
        </div>
      </div>
    </div>
  )
} 