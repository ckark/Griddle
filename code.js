const e = (e, t, n) => {
    '' === e
        ? t.setSuggestions(n)
        : Number.isFinite(+e)
            ? +e < 1
                ? t.setError('Please select at least two elements.')
                : t.setSuggestions([e, ...(n ? n.filter((t) => t.includes(e) && t !== e) : [])])
            : t.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query: t, key: n, result: a }) => {
    switch (n) {
        case 'columns':
            e(t, a, ['Auto', '1', '2', '4', '6', '8', '12', '14', '16']);
            break;
        case 'gap':
            e(t, a, ['0', '2', '4', '8', '16', '24', '32', '40', '48', '56']);
            break;
        case 'sort':
            e(t, a, ['No', 'Ascending', 'Descending']);
            break;
        default:
            return;
    }
});
figma.on('run', async ({ parameters: e }) => {
    if ((await figma.loadAllPagesAsync(), 0 === figma.currentPage.selection.length)) {
        figma.notify('Select at least one item.');
        figma.closePlugin();
        return;
    }
    try {
        const t = Date.now();
        figma.currentPage.selection.length <= 1
            ? figma.closePlugin('Please select at least two elements.')
            : (figma.currentPage.selection.map((e) => ('FRAME' === e.parent.type || 'COMPONENT_SET' === e.parent.type ? (e.parent.layoutMode = 'NONE') : null)),
                ((e, t, n, a) => {
                    t = isNaN(t) ? e.length : parseInt(t);
                    let o = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
                    o =
                        a === 'Descending'
                            ? o.sort((e, t) => e.name.toLowerCase().localeCompare(t.name.toLowerCase()))
                            : a === 'Ascending'
                                ? o.sort((e, t) => t.name.toLowerCase().localeCompare(e.name.toLowerCase()))
                                : o;
                    let r = Infinity, s = Infinity;
                    for (const t of o) {
                        r = Math.min(r, t.x);
                        s = Math.min(s, t.y);
                    }
                    let l = r, c = s, i = 0;
                    for (let a = 0; a < o.length; a++) {
                        const currentNode = o[a];
                        (currentNode.x = l), (currentNode.y = c), (i = Math.max(i, currentNode.height));
                        l += currentNode.width + n;
                        (a + 1) % t == 0 && ((l = r), (c += i + n), (i = 0));
                    }
                })(figma.currentPage.selection, e.columns, parseInt(e.gap), e.sort),
                ((e, t) => {
                    const n = e[0].parent, a = e.map((o) => ({ node: o, parent: n }));
                    t === 'Descending'
                        ? a.sort((e, t) => t.node.name.toLowerCase().localeCompare(e.node.name.toLowerCase()))
                        : t === 'Ascending'
                            ? a.sort((e, t) => e.node.name.toLowerCase().localeCompare(t.node.name.toLowerCase()))
                            : null;
                    a.forEach((item, index) => n.insertChild(index, item.node));
                })(figma.currentPage.selection, e.sort));
        console.clear();
        const n = (Date.now() - t) / 1e3, a = figma.currentPage.selection.length;
        figma.closePlugin(`Griddled 🧇 ${a} items in ${n} seconds.`);
    }
    catch (error) {
        console.error(error);
        figma.closePlugin('An error occurred.');
    }
});
