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
	const format = (e) => {
		(e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
	};
	0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.');
	const grid = (e, a) => {
			let t = [],
				n = [];
			for (e = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name)); e.length; ) t.push(e.splice(0, a));
			let r = figma.currentPage.selection.map((e) => e.parent);
			t.map((e) => {
				let a = figma.createFrame();
				(a.layoutMode = 'HORIZONTAL'),
					(a.name = 'Row'),
					format(a),
					e.map((e) => {
						a.appendChild(e), n.push(e.parent as FrameNode[]);
					});
			});
			let l = figma.createFrame();
			(l.layoutMode = 'VERTICAL'),
				(l.name = 'Grid'),
				format(l),
				n.map((e) => {
					l.appendChild(e), (l = e.parent);
				}),
				r.map((e) => e.appendChild(l));
		},
		singleRow = (e, a) => {
			let t = [],
				n = [];
			for (e = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name)); e.length; ) t.push(e.splice(0, a));
			figma.currentPage.selection.map((e) => e.parent);
			t.map((e) => {
				let a = figma.createFrame();
				(a.layoutMode = 'HORIZONTAL'),
					(a.name = 'Row'),
					format(a),
					e.map((e) => {
						a.appendChild(e), n.push(e.parent as FrameNode[]);
					});
			});
		};
	'1' === parameters.columns
		? (singleRow(figma.currentPage.selection, figma.currentPage.selection.length), figma.closePlugin('Selection griddled. 🧇'))
		: (grid(figma.currentPage.selection, parseInt(parameters.columns)), figma.closePlugin('Selection griddled. 🧇'));
});
