// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

/* Mapping id <-> names for heroes, scenarios and villains */
var heroes = {};
var scenarios = {};
var villains = {};

/* 
Dictionnary to keep per villain:
villain_id
    |___ scenario_id
			|___ mode (standard/expert)
						|___ hero_id
								|___ aspect
*/
var per_villain_table = {};
var per_hero_table = {};
var cst_aspects = ['leadership', 'justice', 'aggression', 'protection'];
var cst_modes = ['standard', 'expert'];

/*
This call is made by the injected.js file
We check the origin and then we store locally in chrome.storage so that this data can be used later by the popup

Made with https://stackoverflow.com/questions/9106519/port-error-could-not-establish-connection-receiving-end-does-not-exist-in-chr
*/
chrome.runtime.onMessageExternal.addListener( (request, sender, sendResponse) => {
    console.log("Received message from " + sender + ": ", request);
	if (request.origin == "injected") {
		var bk_data = JSON.parse(request.data);
		var bk_params = JSON.parse(request.params);
		var last_update_date = new Date().getTime();
		
		bk_params["collections"].forEach(parse_collection);
		
		// Init tables
		init_heroes_table(heroes);
		Object.keys(villains).forEach(init_villains_scenarios_table);
		console.log(per_villain_table);
		
		// Add all fights
		bk_data["liste"].forEach(add_fight_in_tables);
		
		// Save it using the Chrome extension storage API.
        chrome.storage.local.set({'heroes': heroes, 'scenarios': scenarios, 'scenarios': scenarios, 
				'villains': villains, 'per_villain_table': per_villain_table, 'per_hero_table': per_hero_table, 'last_update_date': last_update_date}, function() {
			// Notify that we saved.
			console.log('Data successfully saved locally in chrome.storage.local');
        });
		
		// Notifying content script we received everything
		sendResponse({ received: true });
	}
});

/*
Parse the "collections" element in order to keep track of all available heroes, scenarios or villains
*/
function parse_collection(item, index) {
	if (item["heros"]) {
		item["heros"].forEach(add_hero);
	}
	if (item["scenarios"]) {
		item["scenarios"].forEach(add_scenario);
	}
	if (item["vilains"]) {
		item["vilains"].forEach(add_villain);
	}
}

/* 
Populate mapping dictionnaries
*/
function add_hero(item, index) {
	heroes[item["id"]] = item["name"];
}
function add_scenario(item, index) {
	scenarios[item["id"]] = item["name"];
}
function add_villain(item, index) {
	villains[item["id"]] = item["name"];
}

/*
Given a root element in a table, add another dict as child and init common counters to 0
*/
function init_table_as_dict(root_element, child_element) {
	root_element[child_element] = {};
	root_element[child_element]["counter"] = 0;
	root_element[child_element]["wins"] = 0;
	root_element[child_element]["losses"] = 0;
}
function add_count(root_element, key_to_upd) {
	root_element["counter"] += 1;
	root_element[key_to_upd] += 1;
}

/* 
Init the heroes table: init all to 0, value will be really set once the JSON list of fights will be parsed
*/
function init_heroes_table(heroes) {
	for (let a_hero of Object.keys(heroes)) {
		init_table_as_dict(per_hero_table, a_hero);
		
		for (let a_villain of Object.keys(villains)) {
			init_table_as_dict(per_hero_table[a_hero], a_villain);

			for (let mode of cst_modes) {
				init_table_as_dict(per_hero_table[a_hero][a_villain], mode);
				init_table_as_dict(per_hero_table[a_hero], mode);

				for (let aspect of cst_aspects) {
					init_table_as_dict(per_hero_table[a_hero], aspect);
					init_table_as_dict(per_hero_table[a_hero][mode], aspect);
					init_table_as_dict(per_hero_table[a_hero][a_villain][mode], aspect);
					
					// Ugly: have to loop again otherwise one of the mode gets lost in the process.
					// Fortunately, there are only 2 modes so not a big deal
					for (let inner_mode of cst_modes) {
						init_table_as_dict(per_hero_table[a_hero][aspect], inner_mode);
					}
				}
			}
		}
	}
}

/* 
Init the villains and scenario table with empty data
*/
function init_villains_scenarios_table(item, index) {
	// Here, item is the villain id
	init_table_as_dict(per_villain_table, item);
	per_villain_table[item]["heroes_count"] = {};
	per_villain_table[item]["aspects_count"] = {};
	
	for (let a_scenario of Object.keys(scenarios)) {
		init_table_as_dict(per_villain_table[item], a_scenario);
		per_villain_table[item][a_scenario]["heroes_count"] = {};
		per_villain_table[item][a_scenario]["aspects_count"] = {};
		
		for (let mode of cst_modes) {
			init_table_as_dict(per_villain_table[item][a_scenario], mode);
			init_table_as_dict(per_villain_table[item], mode);
		
			for (let a_hero of Object.keys(heroes)) {
				// Per scenario stats
				init_table_as_dict(per_villain_table[item][a_scenario][mode], a_hero);
				// Overall scenarios
				init_table_as_dict(per_villain_table[item][mode], a_hero);
				
				// Counts per hero for the villain + scenario tuple
				per_villain_table[item][a_scenario]["heroes_count"][a_hero] = 0;
				per_villain_table[item]["heroes_count"][a_hero] = 0;
				
				for (let aspect of cst_aspects) {
					// Per scenario stats
					init_table_as_dict(per_villain_table[item][a_scenario][mode][a_hero], aspect);
					init_table_as_dict(per_villain_table[item][a_scenario][mode], aspect);
					per_villain_table[item][a_scenario]["aspects_count"][aspect] = 0;
					
					// Overall scenarios
					init_table_as_dict(per_villain_table[item][mode][a_hero], aspect);
					init_table_as_dict(per_villain_table[item][mode], aspect);
					per_villain_table[item]["aspects_count"][aspect] = 0;
				}
			}
		}
	}
}

/*
Add a given fight element into appropriate tables
*/
function add_fight_in_tables(item, index) {
	var is_win = [item["reussite"]];
	var the_villain = [item["vilain"]];
	var the_hero = [item["hero"]];
	var the_scenario = [item["scenario"]];
	var the_aspect = [item["aspect"]];
	var the_mode = [item["difficulte"]];
	
	var key_to_upd = "losses";
	if (is_win[0] == true) {
		key_to_upd = "wins";
	}
	
	// Debug logging
	//console.log(is_win + " " + the_villain + " " + the_scenario + " " + the_mode + " " + the_aspect + " " + the_hero);
	
	// Update overall counters for this scenario
	add_count(per_villain_table[the_villain][the_scenario][the_mode][the_hero][the_aspect], key_to_upd);
	add_count(per_villain_table[the_villain][the_scenario][the_mode][the_aspect], key_to_upd);
	add_count(per_villain_table[the_villain][the_scenario][the_mode][the_hero], key_to_upd);
	add_count(per_villain_table[the_villain][the_scenario][the_mode], key_to_upd);
	add_count(per_villain_table[the_villain][the_scenario], key_to_upd);
	
	// Per villain
	add_count(per_villain_table[the_villain][the_mode][the_hero][the_aspect], key_to_upd);
	add_count(per_villain_table[the_villain][the_mode][the_aspect], key_to_upd);
	add_count(per_villain_table[the_villain][the_mode][the_hero], key_to_upd);
	add_count(per_villain_table[the_villain][the_mode], key_to_upd);
	add_count(per_villain_table[the_villain], key_to_upd);
	
	// For this hero
	add_count(per_hero_table[the_hero], key_to_upd);
	add_count(per_hero_table[the_hero][the_villain], key_to_upd);
	add_count(per_hero_table[the_hero][the_villain][the_mode], key_to_upd);
	add_count(per_hero_table[the_hero][the_villain][the_mode][the_aspect], key_to_upd);
	add_count(per_hero_table[the_hero][the_mode][the_aspect], key_to_upd);
	add_count(per_hero_table[the_hero][the_aspect], key_to_upd);
	add_count(per_hero_table[the_hero][the_aspect][the_mode], key_to_upd);
	
	// Aspect and mode for this villain & scenario
	per_villain_table[the_villain][the_scenario]["heroes_count"][the_hero] += 1;
	per_villain_table[the_villain][the_scenario]["aspects_count"][the_aspect] += 1;
	per_villain_table[the_villain]["heroes_count"][the_hero] += 1;
	per_villain_table[the_villain]["aspects_count"][the_aspect] += 1;
}