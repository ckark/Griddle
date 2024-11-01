const handleInput = (input: any, result: any, suggestions: any) => {
	if (input === '') {
		result.setSuggestions(suggestions);
	} else if (Number.isFinite(+input)) {
		if (+input < 1) {
			result.setError('Please select at least two elements.');
		} else {
			const filteredSuggestions = suggestions ? suggestions.filter((suggestion: any) => suggestion.includes(input) && suggestion !== input) : [];
			result.setSuggestions([input, ...filteredSuggestions]);
		}
	} else {
		result.setError('Enter a numeric value.');
	}
};

figma.parameters.on('input', ({ query: input, key: parameterKey, result }) => {
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
	await figma.loadAllPagesAsync();
	const selection = figma.currentPage.selection;

	if (selection.length === 0) {
		figma.notify('Select at least one item.');
		figma.closePlugin();
		return;
	}

	if (selection.length <= 1) {
		figma.closePlugin('Please select at least two elements.');
		return;
	}

	try {
		const startTime = Date.now();

		for (const node of selection) {
			const parent = node.parent as FrameNode | ComponentSetNode;
			if (parent && (parent.type === 'FRAME' || parent.type === 'COMPONENT_SET')) {
				parent.layoutMode = 'NONE';
			}
		}

		let columns = params.columns;
		const gap = parseInt(params.gap) || 0;
		const sortOrder = params.sort;

		columns = columns === 'Auto' ? selection.length : parseInt(columns);
		if (isNaN(columns) || columns < 1) {
			columns = selection.length;
		}

		(function arrangeNodesInGrid() {
			let sortedSelection = selection.slice();

			if (sortOrder === 'Ascending') {
				sortedSelection.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
			} else if (sortOrder === 'Descending') {
				sortedSelection.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
			} else {
				sortedSelection.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
			}

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
				currentNode.x = currentX;
				currentNode.y = currentY;
				maxHeight = Math.max(maxHeight, currentNode.height);
				currentX += currentNode.width + gap;

				if ((i + 1) % columns === 0) {
					currentX = minX;
					currentY += maxHeight + gap;
					maxHeight = 0;
				}
			}
		})();

		if (sortOrder === 'Ascending' || sortOrder === 'Descending') {
			const parent = selection[0].parent;
			const nodesToInsert = selection.slice();

			nodesToInsert.sort((a, b) => (sortOrder === 'Ascending' ? a.name.toLowerCase().localeCompare(b.name.toLowerCase()) : b.name.toLowerCase().localeCompare(a.name.toLowerCase())));

			nodesToInsert.forEach((node, index) => {
				parent.insertChild(index, node);
			});
		}

		const duration = ((Date.now() - startTime) / 1000).toFixed(2);
		const itemCount = selection.length;
		figma.closePlugin(`Griddled 🧇 ${itemCount} items in ${duration} seconds.`);
	} catch (error) {
		console.error(error);
		figma.closePlugin('An error occurred.');
	}
});
