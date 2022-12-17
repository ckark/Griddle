const validateInput = (e, r, t) => {
    if ('' === e)
        r.setSuggestions(t);
    else if (Number.isFinite(+e))
        if (+e <= 0)
            r.setError('Please select at least one element.');
        else {
            const s = t ? t.filter((s) => s.includes(e) && s !== e) : [];
            r.setSuggestions([e, ...s]);
        }
    else
        r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }) => {
    switch (key) {
        case 'columns':
            validateInput(query, result, ['1', '2', '4', '6', '8', '12', '14', '16']);
            break;
        case 'gap':
            validateInput(query, result, ['4', '8', '16', '24', '32', '40', '48', '56']);
            break;
        case 'sort':
            validateInput(query, result, ['No', 'Yes']);
            break;
        default:
            return;
    }
});
figma.on('run', ({ parameters }) => {
    const origX = figma.currentPage.selection.map((e) => e.x).reduce((e, t) => Math.min(e, t)), origY = figma.currentPage.selection.map((e) => e.y).reduce((e, t) => Math.min(e, t)), format = (e) => {
        (e.primaryAxisSizingMode = 'AUTO'), (e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
    }, grid = (e, t) => {
        let a = [], r = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
        if ('Yes' === parameters.sort)
            for (e = r.sort((e, t) => e.name.localeCompare(t.name)); e.length;)
                a.push(e.splice(0, t));
        else
            for (e = r; e.length;)
                a.push(e.splice(0, t));
        let n = figma.currentPage.selection.map((e) => e.parent);
        a.map((e) => {
            let t = figma.createFrame();
            (t.layoutMode = 'HORIZONTAL'),
                (t.name = 'Row'),
                format(t),
                e.map((e) => {
                    t.appendChild(e), r.push(e.parent);
                }),
                (t.layoutMode = 'NONE');
        });
        let l = figma.createFrame();
        (l.layoutMode = 'VERTICAL'),
            (l.name = 'Grid'),
            format(l),
            r.map((e) => {
                l.appendChild(e);
            }),
            n.map((e) => e.appendChild(l));
        let o = [];
        const i = [...figma.currentPage.selection];
        i.map((e) => o.push(e.parent)), i.map((e) => l.parent.appendChild(e));
        const g = [], s = [];
        o.map((e) => s.push(e.y)), i.map((e) => g.push(e.x));
        for (let e = 0; e < i.length; e++)
            for (let t = 0; t < g.length; t++)
                (i[e].x = g[t] + origX), e++;
        for (let e = 0; e < i.length; e++)
            for (let t = 0; t < s.length; t++)
                (i[e].y = s[t] + origY), e++;
        l.remove();
    };
    0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.');
    figma.currentPage.selection.map((e) => {
        if ('COMPONENT_SET' === e.parent.type) {
            figma.currentPage.selection = [];
            figma.closePlugin("You can't rearrange elements in component sets.");
        }
    });
    grid(figma.currentPage.selection, parseInt(parameters.columns)), figma.closePlugin('Selection griddled. 🧇');
});
