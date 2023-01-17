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
	const sorted = () => {
			let e = 0;
			if (
				('Descending' === parameters.sort &&
					figma.currentPage.selection
						.map((a) => {
							const r = a.parent;
							return (e = Math.min(e, r.children.indexOf(a))), { node: a, parent: r };
						})
						.sort((e, a) => e.node.name.toLocaleLowerCase().localeCompare(a.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }))
						.forEach((a, r) => {
							a.parent.insertChild(e + r, a.node);
						}),
				'Ascending' !== parameters.sort)
			)
				return null;
			figma.currentPage.selection
				.map((a) => {
					const r = a.parent;
					return (e = Math.min(e, r.children.indexOf(a))), { node: a, parent: r };
				})
				.sort((e, a) => a.node.name.toLocaleLowerCase().localeCompare(e.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }))
				.forEach((a, r) => {
					a.parent.insertChild(e + r, a.node);
				});
		},
		origX = figma.currentPage.selection.map((e) => e.x).reduce((e, a) => Math.min(e, a)),
		origY = figma.currentPage.selection.map((e) => e.y).reduce((e, a) => Math.min(e, a)),
		format = (e) => {
			(e.primaryAxisSizingMode = 'AUTO'), (e.counterAxisSizingMode = 'AUTO'), (e.clipsContent = !1), (e.itemSpacing = parseInt(parameters.gap)), (e.backgrounds = []), (e.itemReverseZIndex = !0);
		},
		grid = (e, a) => {
			let r = [],
				n = [...figma.currentPage.selection].sort((e, a) => e.x - a.x).sort((e, a) => e.y - a.y);
			if ('No' === parameters.sort) for (e = n; e.length; ) r.push(e.splice(0, a));
			else if ('Descending' === parameters.sort) for (e = n.sort((e, a) => e.name.localeCompare(a.name)); e.length; ) r.push(e.splice(0, a));
			else if ('Ascending' === parameters.sort) for (e = n.sort((e, a) => a.name.localeCompare(e.name)); e.length; ) r.push(e.splice(0, a));
			let t = figma.currentPage.selection.map((e) => e.parent);
			r.map((e) => {
				let a = figma.createFrame();
				(a.layoutMode = 'HORIZONTAL'),
					(a.name = 'Row'),
					format(a),
					e.map((e) => {
						a.appendChild(e), n.push(e.parent);
					}),
					(a.layoutMode = 'NONE');
			});
			let o = figma.createFrame();
			(o.layoutMode = 'VERTICAL'),
				(o.name = 'Grid'),
				format(o),
				n.map((e) => {
					o.appendChild(e);
				}),
				t.map((e) => e.appendChild(o));
			let i = [];
			const s = [...figma.currentPage.selection];
			s.map((e) => i.push(e.parent)), s.map((e) => o.parent.appendChild(e));
			const l = [],
				m = [];
			i.map((e) => m.push(e.y)), s.map((e) => l.push(e.x));
			for (let e = 0; e < s.length; e++) for (let a = 0; a < l.length; a++) (s[e].x = l[a] + origX), e++;
			for (let e = 0; e < s.length; e++) for (let a = 0; a < m.length; a++) (s[e].y = m[a] + origY), e++;
			o.remove(), ('Descending' !== parameters.sort && 'Ascending' !== parameters.sort) || sorted();
		};
	0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.'),
		figma.currentPage.selection.map((e) => {
			'COMPONENT_SET' === e.parent.type && ((figma.currentPage.selection = []), figma.closePlugin("You can't rearrange elements in component sets."));
		}),
		grid(figma.currentPage.selection, parseInt(parameters.columns)),
		figma.closePlugin('Selection griddled. 🧇');
});
