// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// In the injected.js script, any call to chrome.runtime.id will fail so this is a trick (found here: https://stackoverflow.com/questions/9106519/port-error-could-not-establish-connection-receiving-end-does-not-exist-in-chr) in order to send the extension id to the injected script.
let idScript = document.createElement("script");
idScript.setAttribute("type", "application/javascript");
idScript.textContent = 'var myExtId = "' + chrome.runtime.id +'";';
let parent = ( document.head || document.documentElement );
parent.insertBefore( idScript, parent.firstChild );

// Then add the injected script
var script = document.createElement('script'); 
script.src = chrome.runtime.getURL('injected.js');
(document.head||document.documentElement).appendChild(script);

idScript.remove(); //then cleanup 
script.remove(); //then cleanup 