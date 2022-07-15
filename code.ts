const setSuggestionsForNumberInput = (e: string, r: SuggestionResults, t?: string[]) => {
	if ('' === e) r.setSuggestions(t);
	else if (Number.isFinite(Number(e)))
		if (Number(e) <= 0) r.setError('Select at least one element.');
		else {
			const s = t ? t.filter((t) => t.includes(e) && t !== e) : [];
			r.setSuggestions([e, ...s]);
		}
	else r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }: ParameterInputEvent) => {
	if (figma.currentPage.selection.length === 0) {
		result.setError('Select at least one element.');
		return;
	}
	switch (key) {
		case 'columns':
			const columnSize = ['2', '4', '6', '8', '12', '14', '16'];
			setSuggestionsForNumberInput(query, result, columnSize);
			break;

		case 'gap':
			const gapSize = ['4', '6', '8', '12', '14', '16'];
			setSuggestionsForNumberInput(query, result, gapSize);
			break;
		default:
			return;
	}
});
figma.on('run', ({ parameters }: RunEvent) => {
	const split = (r, n) => {
		let a = [],
			p = [];
		for (r = [...figma.currentPage.selection].sort((a, e) => a.name.localeCompare(e.name)); r.length; )
			a.push(r.splice(0, n));
		let o = figma.currentPage.selection.map((a) => a.parent);
		a.forEach((e) => {
			let r = figma.createFrame();
			(r.layoutMode = 'HORIZONTAL'),
				(r.counterAxisSizingMode = 'AUTO'),
				(r.name = 'Row'),
				(r.clipsContent = !1),
				(r.itemSpacing = parseInt(parameters.gap)),
				(r.backgrounds = []),
				e.forEach((i) => {
					r.appendChild(i), p.push(i.parent as FrameNode[]);
				});
		});
		let g = figma.createFrame();
		(g.layoutMode = 'VERTICAL'),
			(g.counterAxisSizingMode = 'AUTO'),
			(g.name = 'Grid'),
			(g.clipsContent = !1),
			(g.itemSpacing = parseInt(parameters.gap)),
			(g.backgrounds = []),
			p.forEach((r) => {
				g.appendChild(r), (g = r.parent);
			}),
			o.forEach((e) => e.appendChild(g));
	};
	split(figma.currentPage.selection, parseInt(parameters.columns));
	figma.closePlugin('Selection griddled. 🧇');
});
