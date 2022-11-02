const e = (e, t, a) => {
	if ('' === e) t.setSuggestions(a);
	else if (Number.isFinite(+e))
		if (+e <= 0) t.setError('Please select at least one element.');
		else {
			const n = a ? a.filter((t) => t.includes(e) && t !== e) : [];
			t.setSuggestions([e, ...n]);
		}
	else t.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query: t, key: a, result: n }) => {
	switch (a) {
		case 'columns':
			e(t, n, ['1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			e(t, n, ['4', '6', '8', '12', '14', '16']);
			break;
		case 'sort':
			e(t, n, ['No', 'Yes']);
			break;
		default:
			return;
	}
}),
	figma.on('run', ({ parameters: e }) => {
		const t = figma.currentPage.selection.map((e) => e.x).reduce((e, t) => Math.min(e, t)),
			a = figma.currentPage.selection.map((e) => e.y).reduce((e, t) => Math.min(e, t)),
			n = (t) => {
				(t.counterAxisSizingMode = 'AUTO'), (t.clipsContent = !1), (t.itemSpacing = parseInt(e.gap)), (t.backgrounds = []), (t.itemReverseZIndex = !0);
			};
		0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.'),
			figma.currentPage.selection.map((e) => {
				'COMPONENT_SET' === e.parent.type && ((figma.currentPage.selection = []), figma.closePlugin("You can't rearrange elements in component sets."));
			}),
			1 === parseInt(e.columns)
				? (((r, l) => {
						let s = figma.createFrame();
						const i = figma.currentPage.selection,
							o = (i.filter((e) => e.parent), []),
							c = [];
						((t, a) => {
							let r = [],
								l = [];
							if ('Yes' === e.sort)
								for (
									t = [...figma.currentPage.selection]
										.sort((e, t) => e.x - t.x)
										.sort((e, t) => e.y - t.y)
										.sort((e, t) => e.name.localeCompare(t.name));
									t.length;

								)
									r.push(t.splice(0, a));
							else for (t = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y); t.length; ) r.push(t.splice(0, a));
							figma.currentPage.selection.map((e) => e.parent),
								r.map((e) => {
									(s.layoutMode = 'HORIZONTAL'),
										n(s),
										e.map((e) => {
											s.appendChild(e), l.push(e.parent);
										});
								});
						})(r, l),
							i.forEach((e) => {
								o.push(e.x), c.push(e.y);
							}),
							i.map((e) => {
								figma.currentPage.appendChild(e);
							}),
							(() => {
								for (let e = 0; e < o.length; e++) for (let a = 0; a < i.length; a++) (i[a].x = o[e] + t), e++;
								for (let e = 0; e < c.length; e++) for (let t = 0; t < i.length; t++) (i[t].y = c[e] + a), e++;
							})(),
							s.remove();
				  })(figma.currentPage.selection, figma.currentPage.selection.length),
				  figma.closePlugin('Selection griddled. 🧇'))
				: (((r, l) => {
						let s = [],
							i = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
						if ('Yes' === e.sort) for (r = i.sort((e, t) => e.name.localeCompare(t.name)); r.length; ) s.push(r.splice(0, l));
						else for (r = i; r.length; ) s.push(r.splice(0, l));
						let o = figma.currentPage.selection.map((e) => e.parent);
						s.map((e) => {
							let t = figma.createFrame();
							(t.layoutMode = 'HORIZONTAL'),
								(t.name = 'Row'),
								n(t),
								e.map((e) => {
									t.appendChild(e), i.push(e.parent);
								}),
								(t.layoutMode = 'NONE');
						});
						let c = figma.createFrame();
						(c.layoutMode = 'VERTICAL'),
							(c.name = 'Grid'),
							n(c),
							i.map((e) => {
								c.appendChild(e);
							}),
							o.map((e) => e.appendChild(c));
						let g = [];
						const m = [...figma.currentPage.selection];
						m.map((e) => g.push(e.parent)), m.map((e) => figma.currentPage.appendChild(e));
						const p = [],
							u = [];
						g.map((e) => u.push(e.y)), m.map((e) => p.push(e.x));
						for (let e = 0; e < m.length; e++) for (let a = 0; a < p.length; a++) (m[e].x = p[a] + t), e++;
						for (let e = 0; e < m.length; e++) for (let t = 0; t < u.length; t++) (m[e].y = u[t] + a), e++;
						c.remove();
				  })(figma.currentPage.selection, parseInt(e.columns)),
				  figma.closePlugin('Selection griddled. 🧇'));
	});
