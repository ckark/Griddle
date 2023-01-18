const validateInput = (e, t, n) => {
	if ('' === e) t.setSuggestions(n);
	else if (Number.isFinite(+e))
		if (+e <= 0) t.setError('Please select at least one element.');
		else {
			const o = n ? n.filter((t) => t.includes(e) && t !== e) : [];
			t.setSuggestions([e, ...o]);
		}
	else t.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query: e, key: t, result: n }) => {
	switch (t) {
		case 'columns':
			validateInput(e, n, ['1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			validateInput(e, n, ['4', '8', '16', '24', '32', '40', '48', '56']);
			break;
		case 'sort':
			validateInput(e, n, ['No', 'Ascending', 'Descending']);
			break;
		default:
			return;
	}
}),
	figma.on('run', ({ parameters: e }) => {
		let t = Number.MAX_SAFE_INTEGER,
			n = Number.MAX_SAFE_INTEGER;
		for (let e of figma.currentPage.selection) (t = Math.min(t, e.x)), (n = Math.min(n, e.y));
		const o = (t) => {
			(t.primaryAxisSizingMode = 'AUTO'), (t.counterAxisSizingMode = 'AUTO'), (t.clipsContent = !1), (t.itemSpacing = parseInt(e.gap)), (t.backgrounds = []), (t.itemReverseZIndex = !0);
		};
		0 === figma.currentPage.selection.length && figma.closePlugin('Please select at least one element.'),
			figma.currentPage.selection.map((e) => {
				'COMPONENT_SET' === e.parent.type && ((figma.currentPage.selection = []), figma.closePlugin("You can't rearrange elements in component sets."));
			}),
			((r, a) => {
				let s = [],
					l = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
				if ('No' === e.sort) for (r = l; r.length; ) s.push(r.splice(0, a));
				else if ('Descending' === e.sort) for (r = l.sort((e, t) => e.name.localeCompare(t.name)); r.length; ) s.push(r.splice(0, a));
				else if ('Ascending' === e.sort) for (r = l.sort((e, t) => t.name.localeCompare(e.name)); r.length; ) s.push(r.splice(0, a));
				let i = [];
				for (let e of figma.currentPage.selection) i.push(e.parent);
				const c = () => {
					let e = figma.createFrame();
					return (e.layoutMode = 'HORIZONTAL'), (e.name = 'Row'), o(e), e;
				};
				for (let e of s) {
					let t = c();
					for (let n of e) t.appendChild(n), l.push(n.parent);
					t.layoutMode = 'NONE';
				}
				let m = figma.createFrame();
				(m.layoutMode = 'VERTICAL'), (m.name = 'Grid'), o(m);
				for (let e of l) m.appendChild(e);
				for (let e of i) e.appendChild(m);
				let f = [];
				const g = [...figma.currentPage.selection];
				for (let e of g) f.push(e.parent), m.parent.appendChild(e);
				const u = [],
					p = [];
				for (let e of f) p.push(e.y);
				for (let e of g) u.push(e.x);
				let d = 0;
				for (let e of g) (e.x = u[d] + t), (e.y = p[d] + n), d++;
				m.remove(),
					('Descending' !== e.sort && 'Ascending' !== e.sort) ||
						(() => {
							let t = 0;
							const n = figma.currentPage.selection.map((e) => {
								const n = e.parent;
								return (t = Math.min(t, n.children.indexOf(e))), { node: e, parent: n };
							});
							if ('Descending' === e.sort) n.sort((e, t) => e.node.name.toLocaleLowerCase().localeCompare(t.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }));
							else {
								if ('Ascending' !== e.sort) return;
								n.sort((e, t) => t.node.name.toLocaleLowerCase().localeCompare(e.node.name.toLocaleLowerCase(), void 0, { numeric: !0 }));
							}
							const o = n[0].parent;
							let r = 0;
							for (let e of n) o.insertChild(t + r, e.node), r++;
						})();
			})(figma.currentPage.selection, parseInt(e.columns)),
			figma.closePlugin('Selection griddled. 🧇');
	});
