import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Node {
    id: string;
    label: string;
    val: number; // Size based on popularity
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
}

interface TopicGraphProps {
    tags: string[];
    selectedTags: string[];
    onTagToggle: (tag: string) => void;
}

const COLORS = [
    '#a855f7', // purple
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#6366f1', // indigo
    '#8b5cf6', // violet
];

export const TopicGraph = ({ tags, selectedTags, onTagToggle }: TopicGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
    const animationRef = useRef<number>();
    const mouseRef = useRef({ x: 0, y: 0 });

    // Handle resizing
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setDimensions({ width: clientWidth, height: clientHeight });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();
        setTimeout(updateDimensions, 100);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Initialize graph data
    useEffect(() => {
        if (!tags.length) return;

        const newNodes: Node[] = tags.map((tag, i) => ({
            id: tag,
            label: tag,
            val: Math.random() * 20 + 10, // Random popularity for now
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            vx: 0,
            vy: 0,
            color: COLORS[i % COLORS.length],
        }));

        setNodes(newNodes);
    }, [tags, dimensions.width, dimensions.height]);

    // Simulation loop
    useEffect(() => {
        if (!nodes.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const simulate = () => {
            const { width, height } = dimensions;
            const centerForce = 0.005;
            const mouseForce = 0.05;

            nodes.forEach((node, i) => {
                // Repulsion between nodes
                nodes.forEach((other, j) => {
                    if (i === j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const minDist = node.val + other.val + 10; // Minimum distance based on radius

                    if (dist < minDist) {
                        const force = (minDist - dist) * 0.1;
                        node.vx += (dx / dist) * force;
                        node.vy += (dy / dist) * force;
                    }
                });

                // Center attraction
                const dx = width / 2 - node.x;
                const dy = height / 2 - node.y;
                node.vx += dx * centerForce;
                node.vy += dy * centerForce;

                // Mouse interaction (repulsion)
                const mouseDx = node.x - mouseRef.current.x;
                const mouseDy = node.y - mouseRef.current.y;
                const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                if (mouseDist < 100) {
                    node.vx += (mouseDx / mouseDist) * mouseForce * 5;
                    node.vy += (mouseDy / mouseDist) * mouseForce * 5;
                }

                // Apply velocity
                node.vx *= 0.95; // Damping
                node.vy *= 0.95;
                node.x += node.vx;
                node.y += node.vy;

                // Boundaries
                const padding = node.val + 5;
                if (node.x < padding) { node.x = padding; node.vx *= -1; }
                if (node.x > width - padding) { node.x = width - padding; node.vx *= -1; }
                if (node.y < padding) { node.y = padding; node.vy *= -1; }
                if (node.y > height - padding) { node.y = height - padding; node.vy *= -1; }
            });

            // Render
            ctx.clearRect(0, 0, width, height);

            // Draw connections (faint lines between all nodes to simulate "network")
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.1)'; // faint purple
            ctx.lineWidth = 1;
            nodes.forEach((node, i) => {
                nodes.forEach((other, j) => {
                    if (i >= j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                });
            });

            nodes.forEach((node) => {
                const isSelected = selectedTags.includes(node.id);

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.val, 0, Math.PI * 2);
                ctx.fillStyle = isSelected ? '#fff' : node.color + '40'; // Transparent if not selected
                ctx.fill();

                if (isSelected) {
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = node.color;
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                ctx.fillStyle = isSelected ? node.color : '#e5e7eb';
                ctx.font = `${isSelected ? 'bold' : ''} 12px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.label, node.x, node.y);
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [nodes, dimensions, selectedTags]);

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseRef.current = {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY
        };
    };

    const handleClick = (e: React.MouseEvent) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const clickedNode = nodes.find((node) => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy < node.val * node.val;
        });

        if (clickedNode) {
            onTagToggle(clickedNode.id);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-[300px] bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800/50 overflow-hidden relative mb-6 group">
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="block cursor-pointer"
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                Hive Mind • Clique para filtrar
            </div>
        </div>
    );
};
