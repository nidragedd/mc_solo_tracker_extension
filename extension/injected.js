// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// To send a message from a 3rd party website we have to use the external Messaging API
// Made with https://stackoverflow.com/questions/9106519/port-error-could-not-establish-connection-receiving-end-does-not-exist-in-chr
chrome.runtime.sendMessage(myExtId, {origin: "injected", data: localStorage['avancement'], params: localStorage['params']}, 
	function(response) {
		console.log(response.received);
	}
);