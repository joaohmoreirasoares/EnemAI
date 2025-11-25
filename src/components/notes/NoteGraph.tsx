import { useEffect, useRef, useState } from 'react';
import { FileText, Network, X } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface Link {
    source: string;
    target: string;
}

interface NoteGraphProps {
    notes: any[];
    onNodeClick: (id: string) => void;
    onCreateConnection?: (sourceId: string) => void;
}

export const NoteGraph = ({ notes, onNodeClick, onCreateConnection }: NoteGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
    const animationRef = useRef<number>();

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
        if (!notes.length) return;

        const newNodes: Node[] = notes.map((note) => ({
            id: note.id,
            label: note.title,
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            vx: 0,
            vy: 0,
        }));

        const newLinks: Link[] = [];
        notes.forEach((sourceNote) => {
            if (!sourceNote.content) return;
            notes.forEach((targetNote) => {
                if (sourceNote.id === targetNote.id) return;
                if (sourceNote.content.includes(`[[${targetNote.title}]]`)) {
                    newLinks.push({ source: sourceNote.id, target: targetNote.id });
                }
            });
        });

        setNodes(newNodes);
        setLinks(newLinks);
    }, [notes, dimensions.width, dimensions.height]);

    // Simulation loop
    useEffect(() => {
        if (!nodes.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const simulate = () => {
            const { width, height } = dimensions;
            const repulsion = 1000;
            const springLength = 150;
            const springStrength = 0.05;
            const damping = 0.9;
            const centerForce = 0.02;

            nodes.forEach((node, i) => {
                nodes.forEach((other, j) => {
                    if (i === j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = repulsion / (dist * dist);
                    node.vx += (dx / dist) * force;
                    node.vy += (dy / dist) * force;
                });

                const dx = width / 2 - node.x;
                const dy = height / 2 - node.y;
                node.vx += dx * centerForce;
                node.vy += dy * centerForce;
            });

            links.forEach((link) => {
                const source = nodes.find((n) => n.id === link.source);
                const target = nodes.find((n) => n.id === link.target);
                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - springLength) * springStrength;

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                source.vx += fx;
                source.vy += fy;
                target.vx -= fx;
                target.vy -= fy;
            });

            nodes.forEach((node) => {
                node.vx *= damping;
                node.vy *= damping;
                node.x += node.vx;
                node.y += node.vy;
                const padding = 20;
                node.x = Math.max(padding, Math.min(width - padding, node.x));
                node.y = Math.max(padding, Math.min(height - padding, node.y));
            });

            ctx.clearRect(0, 0, width, height);

            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 1;
            links.forEach((link) => {
                const source = nodes.find((n) => n.id === link.source);
                const target = nodes.find((n) => n.id === link.target);
                if (!source || !target) return;
                ctx.beginPath();
                ctx.moveTo(source.x, source.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
            });

            nodes.forEach((node) => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#a855f7';
                ctx.fill();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#a855f7';
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#e5e7eb';
                ctx.font = '12px sans-serif';
                ctx.fillText(node.label, node.x + 10, node.y + 4);
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [nodes, links, dimensions]);

    const handleClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const clickedNode = nodes.find((node) => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy < 400;
        });

        if (clickedNode) {
            setMenu({ x, y, nodeId: clickedNode.id });
        } else {
            setMenu(null);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden relative">
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="block cursor-pointer"
                onClick={handleClick}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 pointer-events-none">
                Mapa de Conexões
            </div>

            {menu && (
                <div
                    className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 flex flex-col gap-1 z-10 min-w-[150px] animate-in fade-in zoom-in-95 duration-200"
                    style={{ left: menu.x, top: menu.y }}
                >
                    <div className="flex justify-between items-center px-2 pb-2 border-b border-gray-700 mb-1">
                        <span className="text-xs text-gray-400 font-medium">Ações</span>
                        <button onClick={(e) => { e.stopPropagation(); setMenu(null); }} className="text-gray-500 hover:text-white">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onNodeClick(menu.nodeId);
                            setMenu(null);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-200 hover:bg-purple-600/20 hover:text-purple-300 rounded transition-colors text-left"
                    >
                        <FileText className="h-3 w-3" />
                        Abrir Nota
                    </button>
                    {onCreateConnection && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateConnection(menu.nodeId);
                                setMenu(null);
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-200 hover:bg-purple-600/20 hover:text-purple-300 rounded transition-colors text-left"
                        >
                            <Network className="h-3 w-3" />
                            Criar Conexão
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
