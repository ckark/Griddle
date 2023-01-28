const validateInput = (e: string, r: SuggestionResults, t?: string[]) => {
	if ('' === e) r.setSuggestions(t);
	else if (Number.isFinite(+e))
		if (+e <= 0) r.setError('Please select at least one element.');
		else {
			const s = t ? t.filter((s) => s.includes(e) && s !== e) : [];
			r.setSuggestions([e, ...s]);
		}
	else r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }: ParameterInputEvent) => {
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
figma.on('run', ({ parameters }: RunEvent) => {
	const grid = (e, t, n, a) => {
		t = !0 === isNaN(t) ? e.length : parseInt(t);
		let o = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
		'No' === a ? (e = o) : 'Descending' === a ? (e = o.sort((e, t) => e.name.localeCompare(t.name))) : 'Ascending' === a && (e = o.sort((e, t) => t.name.localeCompare(e.name)));
		let r = 1 / 0,
			l = 1 / 0;
		for (const t of e) (r = Math.min(r, t.x)), (l = Math.min(l, t.y));
		let s = r,
			i = l,
			m = 0;
		for (let a = 0; a < e.length; a++) {
			const o = e[a].width,
				l = e[a].height,
				c = e[a];
			(c.x = s), (c.y = i), (m = Math.max(m, l)), (s += o + n), (a + 1) % t == 0 && ((s = r), (i += m + n), (m = 0));
		}
	};
	0 === figma.currentPage.selection.length
		? figma.closePlugin('Please select at least one element.')
		: (grid(figma.currentPage.selection, parameters.columns, parseInt(parameters.gap), parameters.sort), figma.closePlugin('Selection griddled. 🧇'));
});
