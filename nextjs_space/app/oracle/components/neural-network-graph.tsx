
'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'oracle' | 'agent' | 'data' | 'blockchain';
  label: string;
  active: boolean;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  active: boolean;
}

const NeuralNetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeConnections, setActiveConnections] = useState(0);
  const [dataFlow, setDataFlow] = useState(0);
  
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create nodes representing the oracle network
    const nodes: Node[] = [
      // Central Oracle Hub
      { id: 'oracle-hub', type: 'oracle', label: 'Oracle Hub', x: width / 2, y: height / 2, active: true },
      
      // AI Agents (inner ring)
      { id: 'agent-1', type: 'agent', label: 'MEV Hunter', x: width / 2 - 120, y: height / 2 - 80, active: false },
      { id: 'agent-2', type: 'agent', label: 'Momentum Master', x: width / 2 + 120, y: height / 2 - 80, active: false },
      { id: 'agent-3', type: 'agent', label: 'Volatility Sniper', x: width / 2 - 120, y: height / 2 + 80, active: false },
      { id: 'agent-4', type: 'agent', label: 'Technical Titan', x: width / 2 + 120, y: height / 2 + 80, active: false },
      
      // Data Sources (outer ring)
      { id: 'data-1', type: 'data', label: 'Price Feeds', x: width / 2 - 200, y: height / 2 - 150, active: false },
      { id: 'data-2', type: 'data', label: 'DeFiLlama', x: width / 2 + 200, y: height / 2 - 150, active: false },
      { id: 'data-3', type: 'data', label: 'The Graph', x: width / 2 - 200, y: height / 2 + 150, active: false },
      { id: 'data-4', type: 'data', label: 'CoinGecko', x: width / 2 + 200, y: height / 2 + 150, active: false },
      
      // Blockchain Nodes
      { id: 'chain-1', type: 'blockchain', label: 'Base', x: width / 2 - 280, y: height / 2, active: false },
      { id: 'chain-2', type: 'blockchain', label: 'Ethereum', x: width / 2 + 280, y: height / 2, active: false },
      { id: 'chain-3', type: 'blockchain', label: 'Solana', x: width / 2, y: height / 2 - 200, active: false },
      { id: 'chain-4', type: 'blockchain', label: 'Polygon', x: width / 2, y: height / 2 + 200, active: false },
    ];

    // Create links between nodes
    const links: Link[] = [
      // Oracle to Agents
      { source: 'oracle-hub', target: 'agent-1', active: false },
      { source: 'oracle-hub', target: 'agent-2', active: false },
      { source: 'oracle-hub', target: 'agent-3', active: false },
      { source: 'oracle-hub', target: 'agent-4', active: false },
      
      // Agents to Data Sources
      { source: 'agent-1', target: 'data-1', active: false },
      { source: 'agent-2', target: 'data-2', active: false },
      { source: 'agent-3', target: 'data-3', active: false },
      { source: 'agent-4', target: 'data-4', active: false },
      
      // Data Sources to Blockchains
      { source: 'data-1', target: 'chain-1', active: false },
      { source: 'data-2', target: 'chain-2', active: false },
      { source: 'data-3', target: 'chain-3', active: false },
      { source: 'data-4', target: 'chain-4', active: false },
      
      // Cross-connections for network effect
      { source: 'agent-1', target: 'agent-2', active: false },
      { source: 'agent-2', target: 'agent-4', active: false },
      { source: 'agent-4', target: 'agent-3', active: false },
      { source: 'agent-3', target: 'agent-1', active: false },
    ];

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create defs for gradients and filters
    const defs = svg.append('defs');

    // Create glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('height', '300%')
      .attr('width', '300%')
      .attr('x', '-100%')
      .attr('y', '-100%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '5')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create gradients for different node types
    const createGradient = (id: string, color1: string, color2: string) => {
      const gradient = defs.append('radialGradient')
        .attr('id', id)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color1)
        .attr('stop-opacity', 1);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color2)
        .attr('stop-opacity', 0.8);
    };

    createGradient('oracleGradient', '#3385ff', '#0047b3');
    createGradient('agentGradient', '#00ffff', '#0ea5e9');
    createGradient('dataGradient', '#ff00ff', '#a855f7');
    createGradient('blockchainGradient', '#ffff00', '#eab308');

    // Create container groups
    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const labelGroup = svg.append('g').attr('class', 'labels');

    // Draw links
    const linkElements = linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#555')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3)
      .attr('x1', d => ((d.source as Node).x || 0))
      .attr('y1', d => ((d.source as Node).y || 0))
      .attr('x2', d => ((d.target as Node).x || 0))
      .attr('y2', d => ((d.target as Node).y || 0));

    // Get node colors
    const getNodeColor = (type: string) => {
      switch (type) {
        case 'oracle': return 'url(#oracleGradient)';
        case 'agent': return 'url(#agentGradient)';
        case 'data': return 'url(#dataGradient)';
        case 'blockchain': return 'url(#blockchainGradient)';
        default: return '#666';
      }
    };

    const getNodeSize = (type: string) => {
      switch (type) {
        case 'oracle': return 30;
        case 'agent': return 20;
        case 'data': return 15;
        case 'blockchain': return 18;
        default: return 10;
      }
    };

    // Draw nodes
    const nodeElements = nodeGroup.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => getNodeSize(d.type))
      .attr('fill', d => getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('cx', d => d.x || 0)
      .attr('cy', d => d.y || 0)
      .attr('filter', 'url(#glow)');

    // Draw labels
    const labelElements = labelGroup.selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => d.x || 0)
      .attr('y', d => (d.y || 0) + getNodeSize(d.type) + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text(d => d.label);

    // Animation: Data Flow Simulation
    let activeCount = 0;
    let flowCount = 0;

    const animateDataFlow = () => {
      // Pick random link to activate
      const randomLink = links[Math.floor(Math.random() * links.length)];
      const sourceNode = nodes.find(n => n.id === randomLink.source);
      const targetNode = nodes.find(n => n.id === randomLink.target);

      if (!sourceNode || !targetNode) return;

      // Activate nodes
      sourceNode.active = true;
      targetNode.active = true;
      randomLink.active = true;

      activeCount = nodes.filter(n => n.active).length;
      flowCount++;
      setActiveConnections(activeCount);
      setDataFlow(flowCount);

      // Find link element
      const linkElement = linkElements.filter((d: any) => 
        d.source === randomLink.source && d.target === randomLink.target
      ).node();

      const sourceElement = nodeElements.filter((d: any) => d.id === sourceNode.id).node();
      const targetElement = nodeElements.filter((d: any) => d.id === targetNode.id).node();

      if (linkElement && sourceElement && targetElement) {
        // Animate link glow
        gsap.to(linkElement, {
          strokeOpacity: 1,
          stroke: '#3385ff',
          strokeWidth: 4,
          duration: 0.3,
          ease: 'power2.out',
        });

        gsap.to(linkElement, {
          strokeOpacity: 0.3,
          stroke: '#555',
          strokeWidth: 2,
          duration: 0.5,
          delay: 0.8,
          ease: 'power2.in',
        });

        // Pulse source node
        gsap.to(sourceElement, {
          r: getNodeSize(sourceNode.type) * 1.5,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(sourceElement, {
              r: getNodeSize(sourceNode.type),
              duration: 0.3,
              ease: 'power2.in',
            });
          },
        });

        // Pulse target node (delayed)
        gsap.to(targetElement, {
          r: getNodeSize(targetNode.type) * 1.5,
          duration: 0.3,
          delay: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(targetElement, {
              r: getNodeSize(targetNode.type),
              duration: 0.3,
              ease: 'power2.in',
            });
          },
        });

        // Deactivate after animation
        setTimeout(() => {
          sourceNode.active = false;
          targetNode.active = false;
          randomLink.active = false;
          activeCount = nodes.filter(n => n.active).length;
          setActiveConnections(activeCount);
        }, 1500);
      }
    };

    // Continuous pulse animation for oracle hub
    const oracleHub = nodeElements.filter((d: any) => d.type === 'oracle').node();
    if (oracleHub) {
      gsap.to(oracleHub, {
        r: 35,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // Start data flow animation
    const interval = setInterval(animateDataFlow, 800);

    return () => {
      clearInterval(interval);
      gsap.killTweensOf('*');
    };
  }, []);

  return (
    <Card className="bg-black/40 backdrop-blur border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 terminal-pulse" />
            Neural Oracle Network
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {activeConnections} Active Nodes
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              {dataFlow} Data Packets
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[500px] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-20 grid-rows-16 h-full">
              {Array.from({ length: 320 }).map((_, i) => (
                <div key={i} className="border border-blue-500/20" />
              ))}
            </div>
          </div>
          
          {/* SVG Network Graph */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 10 }}
          />
          
          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 flex gap-6 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#3385ff] to-[#0047b3]" />
              <span>Oracle Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#00ffff] to-[#0ea5e9]" />
              <span>AI Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ff00ff] to-[#a855f7]" />
              <span>Data Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#ffff00] to-[#eab308]" />
              <span>Blockchains</span>
            </div>
          </div>
        </div>
        
        {/* Status text */}
        <div className="mt-4 text-center text-sm text-gray-400 font-mono">
          <p className="text-green-400">⚡ HIVE MIND ACTIVE - Processing real-time data flows</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NeuralNetworkGraph;
