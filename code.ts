const handleInput = (input: any, result: any, suggestions: any) => {
	'' === input
		? result.setSuggestions(suggestions)
		: Number.isFinite(+input)
		? +input < 1
			? result.setError('Please select at least two elements.')
			: result.setSuggestions([input, ...(suggestions ? suggestions.filter((suggestion: any) => suggestion.includes(input) && suggestion !== input) : [])])
		: result.setError('Enter a numeric value.');
};

figma.parameters.on('input', ({ query: input, key: parameterKey, result: result }) => {
	switch (parameterKey) {
		case 'columns':
			handleInput(input, result, ['Auto', '1', '2', '4', '6', '8', '12', '14', '16']);
			break;
		case 'gap':
			handleInput(input, result, ['0', '2', '4', '8', '16', '24', '32', '40', '48', '56']);
			break;
		case 'sort':
			handleInput(input, result, ['No', 'Ascending', 'Descending']);
			break;
		default:
			return;
	}
});

figma.on('run', async ({ parameters: params }) => {
	if ((await figma.loadAllPagesAsync(), 0 === figma.currentPage.selection.length)) {
		figma.notify('Select at least one item.');
		figma.closePlugin();
		return;
	}

	try {
		const startTime = Date.now();
		figma.currentPage.selection.length <= 1
			? figma.closePlugin('Please select at least two elements.')
			: (figma.currentPage.selection.map((node) => ('FRAME' === node.parent.type || 'COMPONENT_SET' === node.parent.type ? (node.parent.layoutMode = 'NONE') : null)),
			  ((selection, columns, gap, sortOrder) => {
					columns = isNaN(columns) ? selection.length : parseInt(columns);
					let sortedSelection = [...figma.currentPage.selection].sort((a, b) => a.x - b.x).sort((a, b) => a.y - b.y);

					sortedSelection =
						sortOrder === 'Descending'
							? sortedSelection.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
							: sortOrder === 'Ascending'
							? sortedSelection.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()))
							: sortedSelection;

					let minX = Infinity,
						minY = Infinity;
					for (const node of sortedSelection) {
						minX = Math.min(minX, node.x);
						minY = Math.min(minY, node.y);
					}
					let currentX = minX,
						currentY = minY,
						maxHeight = 0;
					for (let i = 0; i < sortedSelection.length; i++) {
						const currentNode = sortedSelection[i];
						(currentNode.x = currentX), (currentNode.y = currentY), (maxHeight = Math.max(maxHeight, currentNode.height));
						currentX += currentNode.width + gap;
						(i + 1) % columns == 0 && ((currentX = minX), (currentY += maxHeight + gap), (maxHeight = 0));
					}
				})(figma.currentPage.selection, params.columns, parseInt(params.gap), params.sort),
					((selection, sortOrder) => {
						const parent = selection[0].parent,
							nodesWithParent = selection.map((node) => ({ node, parent }));

						sortOrder === 'Descending'
							? nodesWithParent.sort((a, b) => b.node.name.toLowerCase().localeCompare(a.node.name.toLowerCase()))
							: sortOrder === 'Ascending'
							? nodesWithParent.sort((a, b) => a.node.name.toLowerCase().localeCompare(b.node.name.toLowerCase()))
							: null;

						nodesWithParent.forEach((item, index) => parent.insertChild(index, item.node));
					})(figma.currentPage.selection, params.sort););

		console.clear();
		const duration = (Date.now() - startTime) / 1e3,
			itemCount = figma.currentPage.selection.length;
		figma.closePlugin(`Griddled 🧇 ${itemCount} items in ${duration} seconds.`);
	} catch (error) {
		console.error(error);
		figma.closePlugin('An error occurred.');
	}
});
