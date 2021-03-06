/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/stylers/text_x-arduino/syntax", ["orion/editor/stylers/text_x-csrc/syntax"], function(mC) { //$NON-NLS-1$ //$NON-NLS-0$
	var grammars = [];
	grammars.push.apply(grammars, mC.grammars);
	grammars.push({
		id: "orion.arduino", //$NON-NLS-0$
		contentTypes: ["text/x-arduino"], // TODO could not find a commonly-used value for this //$NON-NLS-0$
		patterns: [
			{include: "orion.c"} //$NON-NLS-0$
		]
	});
	return {
		id: grammars[grammars.length - 1].id,
		grammars: grammars,
		keywords: []
	};
});
