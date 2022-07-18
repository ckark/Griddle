const validateInput = (e, a, t) => {
	if ('' === e) a.setSuggestions(t);
	else if (Number.isFinite(+e))
		if (+e <= 0) a.setError('Select at least one element.');
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
		figma.currentPage.selection.filter((a) => {
			switch (a.parent.type) {
				case 'COMPONENT_SET':
					figma.closePlugin("You can't griddle variants of a component.");
					break;
				default:
					((a, t) => {
						let n = [],
							r = [];
						for (
							a = [...figma.currentPage.selection].sort((e, a) => e.name.localeCompare(a.name));
							a.length;

						)
							n.push(a.splice(0, t));
						let i = figma.currentPage.selection.map((e) => e.parent);
						n.map((a) => {
							let t = figma.createFrame();
							(t.layoutMode = 'HORIZONTAL'),
								(t.counterAxisSizingMode = 'AUTO'),
								(t.name = 'Row'),
								(t.clipsContent = !1),
								(t.itemSpacing = parseInt(e.gap)),
								(t.backgrounds = []),
								a.map((e) => {
									t.appendChild(e), r.push(e.parent);
								});
						});
						let l = figma.createFrame();
						(l.layoutMode = 'VERTICAL'),
							(l.counterAxisSizingMode = 'AUTO'),
							(l.name = 'Grid'),
							(l.clipsContent = !1),
							(l.itemSpacing = parseInt(e.gap)),
							(l.backgrounds = []),
							r.map((e) => {
								l.appendChild(e), (l = e.parent);
							}),
							i.map((e) => e.appendChild(l));
					})(figma.currentPage.selection, parseInt(e.columns)),
						figma.closePlugin('Selection griddled. 🧇');
			}
		});
	});
