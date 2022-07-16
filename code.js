const validateInput = (e, a, t) => {
	if ('' === e) a.setSuggestions(t);
	else if (Number.isFinite(Number(e)))
		if (Number(e) <= 0) a.setError('Select at least one element.');
		else {
			const n = t ? t.filter((a) => a.includes(e) && a !== e) : [];
			a.setSuggestions([e, ...n]);
		}
	else a.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query: e, key: a, result: t }) => {
	switch ((0 === figma.currentPage.selection.length && t.setError('Select at least one element.'), a)) {
		case 'columns':
			validateInput(e, t, ['2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			validateInput(e, t, ['4', '6', '8', '12', '14', '16']);
			break;
		default:
			return;
	}
}),
	figma.on('run', ({ parameters: e }) => {
		((a, t) => {
			let n = [],
				r = [];
			for (a = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name)); a.length; )
				n.push(a.splice(0, t));
			let i = figma.currentPage.selection.map((e) => e.parent);
			n.forEach((a) => {
				let t = figma.createFrame();
				(t.layoutMode = 'HORIZONTAL'),
					(t.counterAxisSizingMode = 'AUTO'),
					(t.name = 'Row'),
					(t.clipsContent = !1),
					(t.itemSpacing = parseInt(e.gap)),
					(t.backgrounds = []),
					a.forEach((e) => {
						t.appendChild(e), r.push(e.parent);
					});
			});
			let s = figma.createFrame();
			(s.layoutMode = 'VERTICAL'),
				(s.counterAxisSizingMode = 'AUTO'),
				(s.name = 'Grid'),
				(s.clipsContent = !1),
				(s.itemSpacing = parseInt(e.gap)),
				(s.backgrounds = []),
				r.forEach((e) => {
					s.appendChild(e), (s = e.parent);
				}),
				i.forEach((e) => e.appendChild(s));
		})(figma.currentPage.selection, parseInt(e.columns)),
			figma.closePlugin('Selection griddled. 🧇');
	});
