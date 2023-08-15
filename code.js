const e = (e, t, n) => {
    if ('' === e)
        t.setSuggestions(n);
    else if (Number.isFinite(+e))
        if (+e < 1)
            t.setError('Please select at least two elements.');
        else {
            const a = n ? n.filter((t) => t.includes(e) && t !== e) : [];
            t.setSuggestions([e, ...a]);
        }
    else
        t.setError('Enter a numeric value.');
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
}),
    figma.on('run', ({ parameters: e }) => {
        const t = Date.now();
        1 >= figma.currentPage.selection.length
            ? figma.closePlugin('Please select at least two elements.')
            : (figma.currentPage.selection.map((e) => {
                ('FRAME' !== e.parent.type && 'COMPONENT_SET' !== e.parent.type) || (e.parent.layoutMode = 'NONE');
            }),
                ((e, t, n, a) => {
                    t = !0 === isNaN(t) ? e.length : parseInt(t);
                    let s = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
                    'No' === a ? (e = s) : 'Descending' === a ? (e = s.sort((e, t) => e.name.localeCompare(t.name))) : 'Ascending' === a && (e = s.sort((e, t) => t.name.localeCompare(e.name)));
                    let o = 1 / 0, r = 1 / 0;
                    for (const t of e)
                        (o = Math.min(o, t.x)), (r = Math.min(r, t.y));
                    let l = o, i = r, c = 0;
                    for (let a = 0; a < e.length; a++) {
                        const s = e[a].width, r = e[a].height, g = e[a];
                        (g.x = l), (g.y = i), (c = Math.max(c, r)), (l += s + n), (a + 1) % t == 0 && ((l = o), (i += c + n), (c = 0));
                    }
                })(figma.currentPage.selection, e.columns, parseInt(e.gap), e.sort),
                ((e, t) => {
                    const n = e[0].parent, a = [];
                    let s = e.length;
                    for (let t = 0; t < s; t++) {
                        const s = e[t];
                        a.push({ node: s, parent: n });
                    }
                    'Descending' === t
                        ? a.sort((e, t) => t.node.name.toLowerCase().localeCompare(e.node.name.toLowerCase()))
                        : 'Ascending' === t && a.sort((e, t) => e.node.name.toLowerCase().localeCompare(t.node.name.toLowerCase()));
                    for (let e = 0; e < s; e++)
                        n.insertChild(e, a[e].node);
                })(figma.currentPage.selection, e.sort)),
            console.clear();
        const n = (Date.now() - t) / 1e3, a = figma.currentPage.selection.length;
        figma.closePlugin(`Griddled 🧇 ${a} items in ${n} seconds.`);
    });
