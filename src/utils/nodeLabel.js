// Graph nodes are numbered internally but shown to users as letters (0 -> A, 1 -> B, ...).
export const nodeLabel = (id) => (id >= 0 && id < 26 ? String.fromCharCode(65 + id) : String(id));
