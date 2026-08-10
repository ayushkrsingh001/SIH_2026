export interface MapNode {
  index: number;
  xPercent: number; // 0 to 100
  yPx: number;      // from top of container
  isLeft: boolean;  // useful for placing decorative elements on the opposite side
}

export const generateMapNodes = (
  count: number,
  nodeSpacingPx: number = 220,
  bottomPaddingPx: number = 200,
  amplitudePercent: number = 25
): { nodes: MapNode[]; containerHeight: number } => {
  const nodes: MapNode[] = [];
  const containerHeight = (count - 1) * nodeSpacingPx + bottomPaddingPx * 2;

  for (let i = 0; i < count; i++) {
    // We want the first node (i=0) to be at the bottom.
    const yPx = containerHeight - bottomPaddingPx - i * nodeSpacingPx;
    
    // Create an S-curve using Math.sin. 
    // A multiplier of ~0.8 means it will sway back and forth nicely.
    const offset = Math.sin(i * 0.8); 
    const xPercent = 50 + offset * amplitudePercent;

    nodes.push({
      index: i,
      xPercent,
      yPx,
      isLeft: offset < 0,
    });
  }

  return { nodes, containerHeight };
};

export const generateSvgPath = (nodes: MapNode[]): string => {
  if (nodes.length === 0) return '';
  
  // Start at the first node
  let path = `M ${nodes[0].xPercent} ${nodes[0].yPx}`;

  // Draw a smooth bezier curve between nodes
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    
    // Control points halfway between Y coordinates for smooth vertical flowing curve
    const cp1y = prev.yPx - Math.abs(prev.yPx - curr.yPx) * 0.5;
    const cp2y = curr.yPx + Math.abs(prev.yPx - curr.yPx) * 0.5;

    path += ` C ${prev.xPercent} ${cp1y}, ${curr.xPercent} ${cp2y}, ${curr.xPercent} ${curr.yPx}`;
  }

  return path;
};
