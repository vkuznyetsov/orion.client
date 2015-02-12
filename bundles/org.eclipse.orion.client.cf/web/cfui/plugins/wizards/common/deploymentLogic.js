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
/*global URL*/
define(['i18n!cfui/nls/messages', 'orion/Deferred', 'orion/objects', 'cfui/cfUtil', 'orion/URITemplate', 'orion/PageLinks', 'cfui/manifestUtils'],
 function(messages, Deferred, objects, mCfUtil, URITemplate, PageLinks, mManifestUtils){

	function _getManifestInstrumentation(manifestContents, results){
		manifestContents = manifestContents || { applications: [{}] };
		var manifestInstrumentation = {};

		if(!manifestContents.applications.length > 0)
			manifestContents.applications.push({});

		if(manifestContents.applications[0].host !== results.host)
			manifestInstrumentation.host = results.host;
		
		if(manifestContents.applications[0].domain !== results.domain)
			manifestInstrumentation.domain = results.domain;

		var manifestServices = manifestContents.applications[0].services;
		var selectedServices = results.services;
		if ((!manifestServices || manifestServices.length === 0) && selectedServices.length > 0) {
			manifestInstrumentation.services = results.services;
		} else if (manifestServices && manifestServices.length != selectedServices.length) {
			manifestInstrumentation.services = results.services;
		} else if (manifestServices && manifestServices.length === selectedServices.length) {
			for (var i=0; i<manifestServices.length; i++){
				if (manifestServices[i] !== selectedServices[i]){
					manifestInstrumentation.services = results.services;
					break;
				}
			}
		}

		var manifestCommand = manifestContents.applications[0].command || "";
		if(manifestCommand !== results.command && typeof results.command === "string") //$NON-NLS-0$
			manifestInstrumentation.command = results.command;
		
		var manifestPath = manifestContents.applications[0].path || "";
		if(manifestPath !== results.path && typeof results.path === "string") //$NON-NLS-0$
			manifestInstrumentation.path = results.path;
		
		var manifestBuildpack = manifestContents.applications[0].buildpack || "";
		if(manifestBuildpack !== results.buildpack && typeof results.buildpack === "string") //$NON-NLS-0$
			manifestInstrumentation.buildpack = results.buildpack;
		
		console.info(manifestContents.applications[0].memory);
		console.info(results.memory);
		if(manifestContents.applications[0].memory !== results.memory && typeof results.memory === "string") //$NON-NLS-0$
			manifestInstrumentation.memory = results.memory;
		
		if(manifestContents.applications[0].instances !== results.instances && typeof results.instances !== "undefined") //$NON-NLS-0$
			manifestInstrumentation.instances = results.instances;

		var manifestTimeout = manifestContents.applications[0].timeout || "";
		if(manifestTimeout !== results.timeout && typeof results.timeout !== "undefined") //$NON-NLS-0$
			manifestInstrumentation.timeout = results.timeout;

		return manifestInstrumentation;
	}

	/**
	 * A utility trigger factory for Cloud Foundry deployment logic
	 * after the 'Deploy' button in a deployment wizard was clicked.
	 */
	function buildDeploymentTrigger(options){
		options = options || {};

		return function(results){
			
			var confName = options.ConfName || results.ConfName;

			var disableUI = options.disableUI;
			var showMessage = options.showMessage;
			var closeFrame = options.closeFrame;

			var postMsg = options.postMsg;
			var postError = options.postError;

			var fileService = options.FileService;
//			var cfService = options.CFService;
			var targetSelection = options.getTargetSelection();

			var userManifest = options.Manifest;
			var contentLocation = options.ContentLocation;
			var appPath = options.AppPath;

			showMessage(messages["saving..."]);
			targetSelection.getSelection(function(selection){
				if(selection === null || selection.length === 0){
					closeFrame();
					return;
				}

				/* disable any UI at this point */
				disableUI();

				var instrumentation = _getManifestInstrumentation(userManifest, results);
				var devMode = options.getDevMode ? options.getDevMode() : null;
				
				var appName = results.name;
				var target = selection;
				
				if (confName){
					mCfUtil.prepareLaunchConfigurationContent(confName, target, appName, appPath, instrumentation, devMode).then(
						function(launchConfigurationContent){
							postMsg(launchConfigurationContent);
						}, function(error){
							postError(error, selection);
						}
					);
					return;
				} else {
					throw new Error("Missing confName");
				}
			}, postError);
		};
	}

	/**
	 * Calculates a uniqe name for the launch config
	 * @returns {orion.Promise}
	 */
	function uniqueLaunchConfigName(fileService, contentLocation, baseName) {
		var deferred = new Deferred();
		fileService.read(contentLocation + "launchConfigurations?depth=1", true).then(
			function(projectDir){
				var children = projectDir.Children;
				var counter = 0;
				for(var i=0; i<children.length; i++){
					var childName = children[i].Name.replace(".launch", "");
					if (baseName === childName){
						if (counter === 0) counter++;
						continue;
					}
					childName = childName.replace(baseName + "-", "");
					var launchConfCounter = parseInt(Number(childName), 10);
					if (!isNaN(launchConfCounter) && launchConfCounter >= counter)
						counter = launchConfCounter + 1;
				}
				deferred.resolve(counter > 0 ? baseName + "-" + counter : baseName);
			}, function(error){
				if (error.status = 404){
					deferred.resolve(baseName);
				} else {
					deferred.reject(error);
				}
			}
		);
		return deferred;
	}

	return {
		buildDeploymentTrigger : buildDeploymentTrigger,
		uniqueLaunchConfigName: uniqueLaunchConfigName,
	};
});
