const validateInput = (e, r, t) => {
    if ('' === e)
        r.setSuggestions(t);
    else if (Number.isFinite(Number(e)))
        if (Number(e) <= 0)
            r.setError('Select at least one element.');
        else {
            const s = t ? t.filter((t) => t.includes(e) && t !== e) : [];
            r.setSuggestions([e, ...s]);
        }
    else
        r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }) => {
    0 === figma.currentPage.selection.length && result.setError('Select at least one element.');
    switch (key) {
        case 'columns':
            validateInput(query, result, ['2', '4', '6', '8', '12', '14', '16']);
            break;
        case 'gap':
            validateInput(query, result, ['4', '6', '8', '12', '14', '16']);
            break;
        default:
            return;
    }
});
figma.on('run', ({ parameters }) => {
    const split = (e, a) => {
        let t = [], n = [];
        for (e = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name)); e.length;)
            t.push(e.splice(0, a));
        let r = figma.currentPage.selection.map((e) => e.parent);
        t.forEach((e) => {
            let a = figma.createFrame();
            (a.layoutMode = 'HORIZONTAL'),
                (a.counterAxisSizingMode = 'AUTO'),
                (a.name = 'Row'),
                (a.clipsContent = !1),
                (a.itemSpacing = parseInt(parameters.gap)),
                (a.backgrounds = []),
                e.forEach((e) => {
                    a.appendChild(e), n.push(e.parent);
                });
        });
        let p = figma.createFrame();
        (p.layoutMode = 'VERTICAL'),
            (p.counterAxisSizingMode = 'AUTO'),
            (p.name = 'Grid'),
            (p.clipsContent = !1),
            (p.itemSpacing = parseInt(parameters.gap)),
            (p.backgrounds = []),
            n.forEach((a) => {
                p.appendChild(a), (p = a.parent);
            }),
            r.forEach((a) => a.appendChild(p));
    };
    split(figma.currentPage.selection, parseInt(parameters.columns));
    figma.closePlugin('Selection griddled. 🧇');
});
