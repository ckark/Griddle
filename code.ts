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
			validateInput(query, result, ['1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			validateInput(query, result, ['4', '6', '8', '12', '14', '16']);
			break;
		case 'sort':
			validateInput(query, result, ['No', 'Yes']);
			break;
		default:
			return;
	}
});
figma.on('run', ({ parameters }: RunEvent) => {
	0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.');
	const origX = figma.currentPage.selection.map((e) => e.x).reduce((a, b) => Math.min(a, b)),
		origY = figma.currentPage.selection.map((e) => e.y).reduce((a, b) => Math.min(a, b)),
		format = (e) => {
			(e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
		},
		grid = (e, a) => {
			let t = [],
				n = [];
			if ('Yes' === parameters.sort) for (e = [...figma.currentPage.selection].sort((e, t) => e.name.localeCompare(t.name)); e.length; ) t.push(e.splice(0, a));
			else for (e = [...figma.currentPage.selection]; e.length; ) t.push(e.splice(0, a));
			let r = figma.currentPage.selection.map((e) => e.parent);
			t.map((e) => {
				let t = figma.createFrame();
				(t.layoutMode = 'HORIZONTAL'),
					(t.name = 'Row'),
					format(t),
					e.map((e) => {
						t.appendChild(e), n.push(e.parent as FrameNode[]);
					}),
					(t.layoutMode = 'NONE');
			});
			let l = figma.createFrame();
			(l.layoutMode = 'VERTICAL'),
				(l.name = 'Grid'),
				format(l),
				n.map((e) => {
					l.appendChild(e), (l = e.parent);
				}),
				r.map((e) => e.appendChild(l));
			let rows = [],
				items = figma.currentPage.selection;
			items.map((e) => rows.push(e.parent)), items.map((e) => figma.currentPage.appendChild(e));
			const columnsX = [],
				rowsY = [];
			rows.map((e) => rowsY.push(e.y)), items.map((e) => columnsX.push(e.x));
			for (let e = 0; e < items.length; e++) for (let l = 0; l < columnsX.length; l++) (items[e].x = columnsX[l] + origX), e++;
			for (let e = 0; e < items.length; e++) for (let l = 0; l < rowsY.length; l++) (items[e].y = rowsY[l] + origY), e++;
			l.remove();
		},
		singleRow = (e, t) => {
			let a = figma.createFrame();
			const r = figma.currentPage.selection,
				l = r.filter((e) => e.parent) as FrameNode[],
				n = [],
				o = [],
				g = l[0].x,
				p = l[0].y;
			((e, t) => {
				let r = [],
					l = [];
				if ('Yes' === parameters.sort) for (e = [...figma.currentPage.selection].sort((e, t) => e.name.localeCompare(t.name)); e.length; ) r.push(e.splice(0, t));
				else for (e = [...figma.currentPage.selection]; e.length; ) r.push(e.splice(0, t));
				figma.currentPage.selection.map((e) => e.parent),
					r.map((e) => {
						(a.layoutMode = 'HORIZONTAL'),
							format(a),
							e.map((e) => {
								a.appendChild(e), l.push(e.parent);
							});
					});
			})(e, t),
				r.forEach((e) => {
					n.push(e.x), o.push(e.y);
				}),
				r.map((e) => {
					figma.currentPage.appendChild(e);
				}),
				(() => {
					for (let e = 0; e < n.length; e++) for (let t = 0; t < r.length; t++) (r[t].x = n[e] + g), e++;
					for (let e = 0; e < o.length; e++) for (let t = 0; t < r.length; t++) (r[t].y = o[e] + p), e++;
				})(),
				a.remove();
		};
	'1' === parameters.columns
		? (singleRow(figma.currentPage.selection, figma.currentPage.selection.length), figma.closePlugin('Selection griddled. 🧇'))
		: (grid(figma.currentPage.selection, parseInt(parameters.columns)), figma.closePlugin('Selection griddled. 🧇'));
});
