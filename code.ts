const v = (e: string, r: SuggestionResults, t?: string[]) => {
	if ('' === e) r.setSuggestions(t);
	else if (Number.isFinite(+e))
		if (+e <= 1) r.setError('Please select at least two elements.');
		else {
			const s = t ? t.filter((s) => s.includes(e) && s !== e) : [];
			r.setSuggestions([e, ...s]);
		}
	else r.setError('Enter a numeric value.');
};
figma.parameters.on('input', ({ query, key, result }: ParameterInputEvent) => {
	switch (key) {
		case 'columns':
			v(query, result, ['Auto', '1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			v(query, result, ['0', '2', '4', '8', '16', '24', '32', '40', '48', '56']);
			break;
		case 'sort':
			v(query, result, ['No', 'Ascending', 'Descending']);
			break;
		default:
			return;
	}
});
figma.on('run', ({ parameters }: RunEvent) => {
	const e = Date.now();
	1 >= figma.currentPage.selection.length
		? figma.closePlugin('Please select at least two elements.')
		: (figma.currentPage.selection.map((e) => {
				('FRAME' !== e.parent.type && 'COMPONENT_SET' !== e.parent.type) || (e.parent.layoutMode = 'NONE');
		  }),
		  ((e, t, a, n) => {
				t = !0 === isNaN(t) ? e.length : parseInt(t);
				let o = [...figma.currentPage.selection].sort((e, t) => e.x - t.x).sort((e, t) => e.y - t.y);
				'No' === n ? (e = o) : 'Descending' === n ? (e = o.sort((e, t) => e.name.localeCompare(t.name))) : 'Ascending' === n && (e = o.sort((e, t) => t.name.localeCompare(e.name)));
				let r = 1 / 0,
					s = 1 / 0;
				for (const t of e) (r = Math.min(r, t.x)), (s = Math.min(s, t.y));
				let l = r,
					c = s,
					m = 0;
				for (let n = 0; n < e.length; n++) {
					const o = e[n].width,
						s = e[n].height,
						i = e[n];
					(i.x = l), (i.y = c), (m = Math.max(m, s)), (l += o + a), (n + 1) % t == 0 && ((l = r), (c += m + a), (m = 0));
				}
		  })(figma.currentPage.selection, parameters.columns, parseInt(parameters.gap), parameters.sort),
		  ((e, t) => {
				const a = e[0].parent,
					n = [];
				let o = e.length;
				for (let t = 0; t < o; t++) {
					const o = e[t];
					n.push({ node: o, parent: a });
				}
				'Descending' === t
					? n.sort((e, t) => t.node.name.toLowerCase().localeCompare(e.node.name.toLowerCase()))
					: 'Ascending' === t && n.sort((e, t) => e.node.name.toLowerCase().localeCompare(t.node.name.toLowerCase()));
				for (let e = 0; e < o; e++) a.insertChild(e, n[e].node);
		  })(figma.currentPage.selection, parameters.sort));
	console.clear();
	const t = (Date.now() - e) / 1e3;
	figma.closePlugin(`Selection griddled 🧇 in ${t} seconds.`);
});
