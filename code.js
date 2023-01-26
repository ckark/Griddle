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
            validateInput(query, result, ['Auto', '1', '2', '4', '6', '8', '12', '14', '16']);
            break;
        case 'gap':
            validateInput(query, result, ['4', '8', '16', '24', '32', '40', '48', '56']);
            break;
        case 'sort':
            validateInput(query, result, ['No', 'Ascending', 'Descending']);
            break;
        default:
            return;
    }
});
figma.on('run', ({ parameters }) => {
    let origX = Number.MAX_SAFE_INTEGER, origY = Number.MAX_SAFE_INTEGER;
    for (let r of figma.currentPage.selection)
        (origX = Math.min(origX, r.x)), (origY = Math.min(origY, r.y));
    const sorted = () => {
        let e = Number.MAX_SAFE_INTEGER;
        const r = figma.currentPage.selection, t = r[0].parent, o = [];
        r.map((r) => {
            (e = Math.min(e, t.children.indexOf(r))),
                o.push({
                    node: r,
                    parent: t,
                });
        }),
            o.sort(function (e, r) {
                return e.node.name < r.node.name ? -1 : e.node.name > r.node.name ? 1 : 0;
            }),
            'Descending' === parameters.sort && o.reverse(),
            o.map((r, o) => t.insertChild(e + o, r.node));
    }, format = (e) => {
        (e.primaryAxisSizingMode = 'AUTO'), (e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
    }, grid = (e, r) => {
        r = !0 === isNaN(r) ? e.length : parseInt(r);
        let t = [], o = [...figma.currentPage.selection].sort((e, r) => e.x - r.x).sort((e, r) => e.y - r.y);
        if ('No' === parameters.sort)
            for (e = o; e.length;)
                t.push(e.splice(0, r));
        else if ('Descending' === parameters.sort)
            for (e = o.sort((e, r) => e.name.localeCompare(r.name)); e.length;)
                t.push(e.splice(0, r));
        else if ('Ascending' === parameters.sort)
            for (e = o.sort((e, r) => r.name.localeCompare(e.name)); e.length;)
                t.push(e.splice(0, r));
        let n = [];
        for (let e of figma.currentPage.selection)
            n.push(e.parent);
        const a = () => {
            let e = figma.createFrame();
            return (e.layoutMode = 'HORIZONTAL'), (e.name = 'Row'), format(e), e;
        };
        for (let e of t) {
            let r = a();
            for (let t of e)
                r.appendChild(t), o.push(t.parent);
            r.layoutMode = 'NONE';
        }
        let s = figma.createFrame();
        (s.layoutMode = 'VERTICAL'), (s.name = 'Grid'), format(s);
        for (let e of o)
            s.appendChild(e);
        for (let e of n)
            e.appendChild(s);
        let i = [];
        const l = [...figma.currentPage.selection];
        for (let e of l)
            i.push(e.parent), s.parent.appendChild(e);
        const p = [], m = [];
        for (let e of i)
            m.push(e.y);
        for (let e of l)
            p.push(e.x);
        let f = 0;
        for (let e of l)
            (e.x = p[f] + origX), (e.y = m[f] + origY), f++;
        s.remove(), ('Descending' !== parameters.sort && 'Ascending' !== parameters.sort) || sorted();
    };
    0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.'),
        figma.currentPage.selection.map((e) => {
            'COMPONENT_SET' === e.parent.type && ((figma.currentPage.selection = []), figma.closePlugin("You can't rearrange elements in component sets."));
        }),
        grid(figma.currentPage.selection, parameters.columns),
        figma.closePlugin('Selection griddled. 🧇');
});
