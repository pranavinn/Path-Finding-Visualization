const nodes = [
    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
    { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }, { id: 10 }
];

const links = [
    { source: 1, target: 2 }, { source: 1, target: 3 },
    { source: 2, target: 4 }, { source: 3, target: 5 },
    { source: 4, target: 5 }, { source: 5, target: 6 },
    { source: 6, target: 7 }, { source: 7, target: 8 },
    { source: 8, target: 9 }, { source: 9, target: 10 },
    { source: 10, target: 1 }
];

const svg = d3.select("#graph");
const width = +svg.attr("width");
const height = +svg.attr("height");

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "#999");

const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 10)
    .attr("fill", "skyblue")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

node.append("title")
    .text(d => d.id);

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
});

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    const order = [];

    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            order.push(node);
            graph[node].forEach(neighbor => {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            });
        }
    }

    return order;
}

function dfs(graph, start, visited = new Set(), order = []) {
    visited.add(start);
    order.push(start);
    graph[start].forEach(neighbor => {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited, order);
        }
    });
    return order;
}

function dijkstra(graph, start) {
    const distances = {};
    const visited = new Set();
    const pq = new PriorityQueue();

    nodes.forEach(node => distances[node.id] = Infinity);
    distances[start] = 0;
    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        const { element: current } = pq.dequeue();
        if (!visited.has(current)) {
            visited.add(current);
            graph[current].forEach(neighbor => {
                const weight = 1;  // assume all edges have weight 1 for simplicity
                const newDist = distances[current] + weight;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    pq.enqueue(neighbor, newDist);
                }
            });
        }
    }

    return distances;
}

class PriorityQueue {
    constructor() {
        this.values = [];
    }

    enqueue(element, priority) {
        this.values.push({ element, priority });
        this.sort();
    }

    dequeue() {
        return this.values.shift();
    }

    isEmpty() {
        return this.values.length === 0;
    }

    sort() {
        this.values.sort((a, b) => a.priority - b.priority);
    }
}

function visualizeBFS() {
    const graph = {
        1: [2, 3],
        2: [4],
        3: [5],
        4: [5],
        5: [6],
        6: [7],
        7: [8],
        8: [9],
        9: [10],
        10: [1]
    };

    const bfsOrder = bfs(graph, 1);
    console.log("BFS Order:", bfsOrder);

    highlightNodes(bfsOrder);
}

function visualizeDFS() {
    const graph = {
        1: [2, 3],
        2: [4],
        3: [5],
        4: [5],
        5: [6],
        6: [7],
        7: [8],
        8: [9],
        9: [10],
        10: [1]
    };

    const dfsOrder = dfs(graph, 1);
    console.log("DFS Order:", dfsOrder);

    highlightNodes(dfsOrder);
}

function visualizeDijkstra() {
    const graph = {
        1: [2, 3],
        2: [4],
        3: [5],
        4: [5],
        5: [6],
        6: [7],
        7: [8],
        8: [9],
        9: [10],
        10: [1]
    };

    const distances = dijkstra(graph, 1);
    console.log("Dijkstra's distances:", distances);

    const order = Object.keys(distances).sort((a, b) => distances[a] - distances[b]);
    highlightNodes(order);
}

function highlightNodes(order) {
    const delay = 500;
    order.forEach((id, index) => {
        setTimeout(() => {
            svg.selectAll("circle").filter(d => d.id == id)
                .attr("fill", "green");
        }, delay * index);
    });
}

function resetGraph() {
    svg.selectAll("circle")
        .attr("fill", "skyblue");
}
