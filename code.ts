const validateInput = (e: string, r: SuggestionResults, t?: string[]) => {
	if ('' === e) r.setSuggestions(t);
	else if (Number.isFinite(+e))
		if (+e <= 0) r.setError('Select at least one element.');
		else {
			const s = t ? t.filter((t) => t.includes(e) && t !== e) : [];
			r.setSuggestions([e, ...s]);
		}
	else r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }: ParameterInputEvent) => {
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
figma.on('run', ({ parameters }: RunEvent) => {
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
	figma.currentPage.selection.filter((e) => {
		switch (e.parent.type) {
			case 'COMPONENT_SET':
				figma.closePlugin("You can't griddle variants of a component.");
				break;
			default:
				split(figma.currentPage.selection, parseInt(parameters.columns)),
					figma.closePlugin('Selection griddled. 🧇');
		}
	});
});
