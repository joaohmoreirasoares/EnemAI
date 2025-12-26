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
    className?: string; // Add className prop
}

export const NoteGraph = ({ notes, onNodeClick, onCreateConnection, className = "" }: NoteGraphProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [menu, setMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const animationRef = useRef<number>();
    const dragRef = useRef<{ id: string | null, startX: number, startY: number }>({ id: null, startX: 0, startY: 0 });
    const wasDraggingRef = useRef(false);

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

    // Helper for deterministic random based on string
    const pseudoRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const result = Math.abs(hash) / 2147483647;
        return result;
    };

    // Initialize graph data
    useEffect(() => {
        if (!notes.length) return;

        // Only initialize nodes if they don't exist or if the count changed significantly
        // to preserve positions if we just re-rendered. 
        // However, for this request, we want deterministic positions on open.

        const newNodes: Node[] = notes.map((note) => {
            // Use pseudo-random positions to keep them stable across reloads
            // but spread them out enough
            const randX = pseudoRandom(note.id + 'x');
            const randY = pseudoRandom(note.id + 'y');

            return {
                id: note.id,
                label: note.title,
                x: dimensions.width * 0.2 + (randX * dimensions.width * 0.6),
                y: dimensions.height * 0.2 + (randY * dimensions.height * 0.6),
                vx: 0,
                vy: 0,
            };
        });

        const newLinks: Link[] = [];
        notes.forEach((sourceNote) => {
            if (!sourceNote.content) return;

            // Simple HTML strip to ensure we catch text accurately, or just match on raw string
            // Matching on raw string is usually fine for [[...]] unless it spans tags
            const matches = sourceNote.content.matchAll(/\[\[(.*?)\]\]/gi);

            for (const match of matches) {
                const linkedTitle = match[1].trim().toLowerCase();
                const targetNote = notes.find(n => n.title.toLowerCase() === linkedTitle);

                if (targetNote && targetNote.id !== sourceNote.id) {
                    // Prevent duplicates if multiple links to same note exist
                    if (!newLinks.some(l => l.source === sourceNote.id && l.target === targetNote.id)) {
                        newLinks.push({ source: sourceNote.id, target: targetNote.id });
                    }
                }
            }
        });

        setNodes(newNodes);
        setLinks(newLinks);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes]);

    // Simulation loop
    useEffect(() => {
        if (!nodes.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const simulate = () => {
            const { width, height } = dimensions;
            // Reverted to balanced values that favor good angular distribution
            const repulsion = 5000;
            const springLength = 200;
            const springStrength = 0.05;
            const damping = 0.9;
            const centerForce = 0.01;

            nodes.forEach((node, i) => {
                // Skip physics for dragged node
                if (node.id === dragRef.current.id) {
                    node.vx = 0;
                    node.vy = 0;
                    return;
                }

                nodes.forEach((other, j) => {
                    if (i === j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    // Balanced interaction distance to ensure local angular separation without global chaos
                    if (dist < 600) {
                        const force = repulsion / (dist * dist);
                        node.vx += (dx / dist) * force;
                        node.vy += (dy / dist) * force;
                    }
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

                if (source.id !== dragRef.current.id) {
                    source.vx += fx;
                    source.vy += fy;
                }
                if (target.id !== dragRef.current.id) {
                    target.vx -= fx;
                    target.vy -= fy;
                }
            });

            nodes.forEach((node) => {
                if (node.id === dragRef.current.id) return;

                node.vx *= damping;
                node.vy *= damping;

                // Limit max velocity to prevent jitter
                const maxVel = 5;
                const vel = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                if (vel > maxVel) {
                    node.vx = (node.vx / vel) * maxVel;
                    node.vy = (node.vy / vel) * maxVel;
                }

                node.x += node.vx;
                node.y += node.vy;

                const padding = 30;
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
                // Increased radius from 6 to 9 (150%)
                ctx.arc(node.x, node.y, 9, 0, Math.PI * 2);
                ctx.fillStyle = '#a855f7';
                ctx.fill();
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#a855f7';
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#e5e7eb';
                ctx.font = '14px sans-serif'; // Slightly larger font
                ctx.fillText(node.label, node.x + 14, node.y + 5);
            });

            animationRef.current = requestAnimationFrame(simulate);
        };

        simulate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [nodes, links, dimensions]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        wasDraggingRef.current = false; // Reset drag state

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        // Check if clicked on a node
        // Radius is 9, so hit area slightly larger
        const clickedNode = nodes.find((node) => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy < 225; // 15^2
        });

        if (clickedNode) {
            // Left click for drag
            if (e.button === 0) {
                dragRef.current = { id: clickedNode.id, startX: x, startY: y };
                setDraggingNodeId(clickedNode.id);
            }
        }

        // Also handle menu click (existing logic, but maybe move to right click or keep on click if not dragging?)
        // The original code used click for menu. Let's keep click for menu but maybe distinguish drag?
        // Actually, let's use onClick for menu and onMouseDown for drag.
        // If we drag, we shouldn't trigger the click menu.
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragRef.current.id) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        // Check if moved enough to be considered a drag
        const dx = x - dragRef.current.startX;
        const dy = y - dragRef.current.startY;
        if (dx * dx + dy * dy > 5) {
            wasDraggingRef.current = true;
        }

        // Update the dragged node position directly
        const node = nodes.find(n => n.id === dragRef.current.id);
        if (node) {
            node.x = x;
            node.y = y;
            // Force re-render isn't needed because the simulation loop reads the mutable node object
            // but we might need to ensure the loop picks it up. 
            // Since `nodes` is state but the objects inside are mutable references in this context, it works for the canvas loop.
        }
    };

    const handleMouseUp = () => {
        dragRef.current = { id: null, startX: 0, startY: 0 };
        setDraggingNodeId(null);
    };

    const handleClick = (e: React.MouseEvent) => {
        // If we were dragging, don't show menu
        if (wasDraggingRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        const clickedNode = nodes.find((node) => {
            const dx = node.x - x;
            const dy = node.y - y;
            return dx * dx + dy * dy < 225;
        });

        if (clickedNode) {
            setMenu({ x, y, nodeId: clickedNode.id });
        } else {
            setMenu(null);
        }
    };

    return (
        <div ref={containerRef} className={`w-full h-full overflow-hidden relative ${className}`}>
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="block cursor-pointer"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
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
