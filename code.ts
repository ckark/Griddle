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
			validateInput(query, result, ['2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			validateInput(query, result, ['4', '6', '8', '12', '14', '16']);
			break;
		default:
			return;
	}
});
figma.on('run', ({ parameters }: RunEvent) => {
	0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.');
	const split = (e, a) => {
		let t = [],
			n = [];
		for (e = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name)); e.length; )
			t.push(e.splice(0, a));
		let r = figma.currentPage.selection.map((e) => e.parent);
		t.map((e) => {
			let a = figma.createFrame();
			(a.layoutMode = 'HORIZONTAL'),
				(a.counterAxisSizingMode = 'AUTO'),
				(a.name = 'Row'),
				(a.clipsContent = !1),
				(a.itemSpacing = parseInt(parameters.gap)),
				(a.backgrounds = []),
				e.map((e) => {
					a.appendChild(e), n.push(e.parent as FrameNode[]);
				});
		});
		let p = figma.createFrame();
		(p.layoutMode = 'VERTICAL'),
			(p.counterAxisSizingMode = 'AUTO'),
			(p.name = 'Grid'),
			(p.clipsContent = !1),
			(p.itemSpacing = parseInt(parameters.gap)),
			(p.backgrounds = []),
			n.map((a) => {
				p.appendChild(a), (p = a.parent);
			}),
			r.map((a) => a.appendChild(p));
	};
	split(figma.currentPage.selection, parseInt(parameters.columns)), figma.closePlugin('Selection griddled. 🧇');
});
