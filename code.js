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
            validateInput(query, result, ['0', '2', '4', '8', '16', '24', '32', '40', '48', '56']);
            break;
        case 'sort':
            validateInput(query, result, ['No', 'Ascending', 'Descending']);
            break;
        default:
            return;
    }
});
figma.on('run', ({ parameters }) => {
    1 >= figma.currentPage.selection.length
        ? figma.closePlugin('Please select at least two elements.')
        : (figma.currentPage.selection.map((e) => {
            ('FRAME' !== e.parent.type && 'COMPONENT_SET' !== e.parent.type) || (e.parent.layoutMode = 'NONE');
        }),
            ((e, t, a, n) => {
                t = !0 === isNaN(t) ? e.length : parseInt(t);
                let r = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
                'No' === n ? (e = r) : 'Descending' === n ? (e = r.sort((e, t) => e.name.localeCompare(t.name))) : 'Ascending' === n && (e = r.sort((e, t) => t.name.localeCompare(e.name)));
                let l = 1 / 0, o = 1 / 0;
                for (const t of e)
                    (l = Math.min(l, t.x)), (o = Math.min(o, t.y));
                let s = l, c = o, i = 0;
                for (let n = 0; n < e.length; n++) {
                    const r = e[n].width, o = e[n].height, m = e[n];
                    (m.x = s), (m.y = c), (i = Math.max(i, o)), (s += r + a), (n + 1) % t == 0 && ((s = l), (c += i + a), (i = 0));
                }
            })(figma.currentPage.selection, parameters.columns, parseInt(parameters.gap), parameters.sort),
            console.clear(),
            figma.closePlugin('Selection griddled. 🧇'));
});
