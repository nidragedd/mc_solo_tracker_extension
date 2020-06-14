document.addEventListener('DOMContentLoaded', function () {
	load_from_storage();
});

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

function load_from_storage() {
	console.log('Loading from chrome.storage...');
	
	var last_update_date;
	
	chrome.storage.local.get(['heroes', 'scenarios', 'villains', 'per_villain_table', 'per_hero_table', 'last_update_date'], function(result){
		heroes = result.heroes;
		scenarios = result.scenarios;
		villains = result.villains;
		per_villain_table = result.per_villain_table;
		per_hero_table = result.per_hero_table;
		last_update_date = result.last_update_date;
		
		// Debug logging
		//console.log('data read from popup: ' + heroes);
		
		// If something has been returned, handle it
		if (heroes && scenarios && villains && per_villain_table && per_hero_table) {
			// Check last update date
			if (last_update_date) {
				last_update_date = new Date(last_update_date).toDateString();
				showLastUpdated(last_update_date);
				
				// Do not forget that the call is asynchronous so display
				// must be done only once loading is over
				display();
			} else {
				showLastUpdated('');
			}
		} else {
			showLastUpdated('');
		}	
	});
}

function display() {
	init_villains_link();
	show_global_villains_pie();
	show_global_heroes_stats();
}

function showLastUpdated(last_update_date) {
	var content = '';
	console.log('in showLastUpdated last_update_date:' + last_update_date);
	if (last_update_date != '') {
		content = '<p><i>Dernier chargement des données: ' + last_update_date + '</i></p>'
	} else {
		content = '<p>Aucune donnée trouvée. Faites une première visite sur le site <a href="https://marvelchampions.azurewebsites.net">https://marvelchampions.azurewebsites.net</a> pour charger vos informations.</p>'
	}
	document.getElementById('last_updated').innerHTML = content;
}

/*
Add a row in a table. Values are in the _vals_ array
*/
function add_hero_row(table_id, vals, row_id) {
	var table_ref = document.getElementById(table_id);
	var new_row = table_ref.insertRow(row_id);
	idx = 0;
	
	for (const a_val of vals) {
		var new_cell = new_row.insertCell(idx);
		var new_txt;
		if (idx == 0) {
			new_txt = document.createElement("img");
			new_txt.setAttribute("src", "./images/heroes/" + a_val + ".png");
			new_txt.setAttribute("width", "50px");
			new_txt.setAttribute("height", "50px");
		} else if (idx == 1) {
			new_txt = document.createTextNode(a_val);
		} else if (idx > 1) {
			if (a_val > 0) {
				new_txt = document.createElement("img");
				
				if (a_val == 1) {
					new_txt.setAttribute("src", "./images/lost.png");
					new_cell.setAttribute("class", "lost");
				} else {
					new_txt.setAttribute("src", "./images/won.png");
					new_cell.setAttribute("class", "won");
				}
			} else {
				new_txt = document.createTextNode("");
				new_cell.setAttribute("class", "no_play");
			}
		}
		new_cell.appendChild(new_txt);
		
		idx++;
	}
}

/*
Used to reinitialize the hero checklist table by removing all rows except the table header
*/
function reinit_hero_table(table_id) {
	var table_ref = document.getElementById(table_id);
	var rows_count = table_ref.rows.length;
	while (table_ref.rows.length > 2) {
		table_ref.deleteRow(2);
	}
}


/*
Some generic and utils functions to manipulate the DOM
*/
function show_element(element_id, display, mode) {
	val = 'none';
	if (display) {
		if (mode) {
			val = mode;
		} else {
			val = 'block';
		}
	}
	document.getElementById(element_id).style.display = val;
}

function insert_text(element_id, the_text) {
	document.getElementById(element_id).innerText = the_text;
}

function set_html_content(element_id, the_html) {
	document.getElementById(element_id).innerHTML = the_html;
}



/*
Display Villain and Scenario names
*/
function display_villains_title(villain_id) {
	villain_name = villains[villain_id];
	
	insert_text('villain_name', villain_name);
	document.getElementById('villain_img').src = './images/villains/' + villain_id + '.png';
	
	insert_text('scenario_name', 'Choisissez un scénario');
	show_element('villain_stat_content', false);
	show_element('villain_stat_container', false);
	clean_villains_charts();
	show_element('villain_scenario_checklist', false);
	show_element('villain_scenario_checklist_legend', false);
}
function display_scenario_title(scenario_id) {
	scenario_name = scenarios[scenario_id];
	insert_text('scenario_name', scenario_name);
}

/*
Init all villains list with a link and a dedicated event listener
*/
function init_villains_link() {
	content = '';
	for (const [key, value] of Object.entries(villains)) {
		content += '<a href="#" id="vid_' + key + '" class="a_villain_anchor">' + value + '</a>';
	}
	set_html_content('villains_link', content);
	
	// Add event listeners to react on click for those <a> elements
	const v_anchors = document.querySelectorAll(".a_villain_anchor");
	for (let button of v_anchors) {
		button.addEventListener('click', function(event) {
			console.log('Click on ' + event.srcElement.id);
			
			villain_id = event.srcElement.id.match("vid_(v[0-9]+)")[1];
			display_villains_title(villain_id);
			
			init_scenarios_link(event.srcElement.id);
		});
	}
}

/*
Init all scenarios with a link and a dedicated event listener
*/
function init_scenarios_link(villain_id) {
	content = '';
	for (const [key, value] of Object.entries(scenarios)) {
		content += '<a href="#" id="sid_' + key + '_' + villain_id + '" class="a_scenario_anchor">' + value + '</a>';
	}
	set_html_content('villains_scenarios_link', content);
	
	// Add event listeners to react on click for those <a> elements
	const v_anchors = document.querySelectorAll(".a_scenario_anchor");
	for (let button of v_anchors) {
		button.addEventListener('click', function(event) {
			console.log('Click on ' + event.srcElement.id);
			
			// Extract id from anchor id value and get human readable name from dictionnaries
			villain_id = event.srcElement.id.match("vid_(v[0-9]+)")[1];
			scenario_id = event.srcElement.id.match("sid_(s[0-9]+)_")[1];
			
			display_scenario_title(scenario_id);
			
			// Empty hero table
			reinit_hero_table('villain_scenario_checklist');
			
			display_stats_villains_scenario(villain_id, scenario_id);
		});
	}
}

/*
Here goes the main logic to display stats for a given tuple Villain + Scenario
*/
function display_stats_villains_scenario(villain_id, scenario_id) {
	displayContent = '';
	if (per_villain_table[villain_id][scenario_id]["counter"] > 0) {
		displayContent += 'Ce scénario a été joué ' + per_villain_table[villain_id][scenario_id]["counter"] + ' fois !';
		displayContent += '<br />';
		
		show_chart_villain_scenario_mode(villain_id, scenario_id);
		show_chart_villain_played_heroes(villain_id, scenario_id);
		show_chart_villain_played_aspects(villain_id, scenario_id);
		show_element('villain_stat_container', true, 'flex');
		
		display_hero_checklist_table(villain_id, scenario_id);
	} else {
		displayContent += "Ce scénario n'a pas encore été joué ! En avant !";
		show_element('villain_scenario_checklist', false);
		show_element('villain_scenario_checklist_legend', false);
		show_element('villain_stat_container', false);
		clean_villains_charts();
	}
	
	// Update the div element that contains the stats
	set_html_content('villain_stat_content', displayContent);
	show_element('villain_stat_content', true);
}

/* 
Handling the Heroes checklist:
	- iterate over the list of all availables heroes
	- check for each if this hero has been played at least once against this villain + scenario
	- retrieve wins/losses per mode (standard/expert) and per aspect (justice/leadership/aggression/protection)
*/
function display_hero_checklist_table(villain_id, scenario_id) {
	row_id = 1;
	for (const a_hero of Object.keys(heroes)) {
		// If this hero has been played at least once against this villain + scenario
		nb_games = per_villain_table[villain_id][scenario_id]["heroes_count"][a_hero];
		if (nb_games > 0) {
			vals = [];
			vals.push(a_hero);
			vals.push(nb_games);
			
			// Get for standard per aspect, then expert
			for (let mode of ['standard', 'expert']) {
				for (let aspect of ['aggression', 'leadership', 'justice', 'protection']) {
					nb_played = per_villain_table[villain_id][scenario_id][mode][a_hero][aspect]["counter"];
					// Played this mode and aspect ?
					if (nb_played > 0) {
						won = per_villain_table[villain_id][scenario_id][mode][a_hero][aspect]["wins"];
						if (won > 0) {
							// 2 means this villain + scenario was once beaten in this mode by this hero with this aspect
							vals.push(2);
						} else {
							// 1 means this villain + scenario was played but never beaen in this mode by this hero with this aspect
							vals.push(1);
						}
					} else {
						// 0 means this villain + scenario was never played in this mode by this hero with this aspect
						vals.push(0);
					}
				}
			}
			row_id ++;
			
			// Add a row in table
			add_hero_row('villain_scenario_checklist', vals, row_id);
		}
	}
	
	// Show the table
	show_element('villain_scenario_checklist', true, 'inline-table');
	show_element('villain_scenario_checklist_legend', true, 'inline-table');
}

/*
CHARTS functions below
*/
var VillainScenarioStdVsExpertChart;
var VillainScenarioHeroesChart;
var VillainScenarioAspectsChart;

// Chart colors dictionnary
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)',
	aggression: 'rgb(204, 0, 0)',
	leadership: 'rgb(60, 120, 216)',
	protection: 'rgb(147, 196, 125)',
	justice: 'rgb(241, 194, 50)'
};

function clean_villains_charts() {
	if (VillainScenarioStdVsExpertChart) {
		console.log("Destroying VillainScenarioStdVsExpertChart");
		VillainScenarioStdVsExpertChart.destroy();
	}
	if (VillainScenarioHeroesChart) {
		console.log("Destroying VillainScenarioHeroesChart");
		VillainScenarioHeroesChart.destroy();
	}
	if (VillainScenarioAspectsChart) {
		console.log("Destroying VillainScenarioAspectsChart");
		VillainScenarioAspectsChart.destroy();
	}
}

function show_chart_villain_scenario_mode(villain_id, scenario_id) {
	var data_1 = [];
	var data_2 = [];
	
	data_1.push(per_villain_table[villain_id][scenario_id]["standard"]["wins"]);
	data_2.push(per_villain_table[villain_id][scenario_id]["standard"]["losses"]);
	data_1.push(per_villain_table[villain_id][scenario_id]["expert"]["wins"]);
	data_2.push(per_villain_table[villain_id][scenario_id]["expert"]["losses"]);
	
	var ctxVillainScenarioStdVsExpert = document.getElementById('VillainScenarioStdVsExpert');
	VillainScenarioStdVsExpertChart = new Chart(ctxVillainScenarioStdVsExpert, {
		type: 'horizontalBar',
		data: {
			labels: ['Standard', 'Expert'],
			datasets: [{
				label: 'Victoires',
				backgroundColor: window.chartColors.green,
				data: data_1
			}, {
				label: 'Défaites',
				backgroundColor: window.chartColors.red,
				data: data_2
			}]

		},
		options: {
			title: {
				display: true,
				text: 'Modes joués'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			}
		}
	});
}

function show_chart_villain_played_heroes(villain_id, scenario_id) {
	var heroes_played_labels = [];
	var heroes_played_labels_count = [];
	
	for (const [key, value] of Object.entries(per_villain_table[villain_id][scenario_id]["heroes_count"])) {
		if (value > 0) {
			heroes_played_labels.push(heroes[key]);
			heroes_played_labels_count.push(value);
		}
	}
	
	var ctxVillainScenarioHeroes = document.getElementById('VillainScenarioHeroes');
	VillainScenarioHeroesChart = new Chart(ctxVillainScenarioHeroes, {
		type: 'horizontalBar',
		data: {
			labels: heroes_played_labels,
			datasets: [{
				label: 'Nb combats',
				backgroundColor: [
					window.chartColors.red,
					window.chartColors.orange,
					window.chartColors.yellow,
					window.chartColors.green,
					window.chartColors.blue,
				],
				data: heroes_played_labels_count
			}]

		},
		options: {
			title: {
				display: true,
				text: 'Héros joués'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			}
		}
	});
}

function show_chart_villain_played_aspects(villain_id, scenario_id) {
	var aspects_played_labels = [];
	var aspects_played_labels_count = [];
	
	for (let aspect of ['justice', 'leadership', 'aggression', 'protection']) {
		aspects_played_labels.push(aspect);
		aspects_played_labels_count.push(per_villain_table[villain_id][scenario_id]["aspects_count"][aspect]);
	}
	
	var ctxVillainScenarioAspects = document.getElementById('VillainScenarioAspects');
	VillainScenarioAspectsChart = new Chart(ctxVillainScenarioAspects, {
		type: 'horizontalBar',
		data: {
			labels: aspects_played_labels,
			datasets: [{
				label: 'Nb combats',
				backgroundColor: [
					window.chartColors.justice,
					window.chartColors.leadership,
					window.chartColors.aggression,
					window.chartColors.protection
				],
				data: aspects_played_labels_count
			}]

		},
		options: {
			title: {
				display: true,
				text: 'Aspects joués'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			}
		}
	});
}

function show_global_villains_pie() {
	var main_villains_stats = [];
	var main_villains_labels = [];
	var total_fights = 0;
	for (const v_id of Object.keys(villains)) {
		if (per_villain_table[v_id]["counter"] > 0) {
			main_villains_labels.push(villains[v_id]);
			main_villains_stats.push(per_villain_table[v_id]["counter"]);
			total_fights += per_villain_table[v_id]["counter"];
		}
	}
	
	var ctxMainVillainData = document.getElementById('AllVillainsData');	
	var mainVillainDataChart = new Chart(ctxMainVillainData, {
		type: 'doughnut',	
		data: {
			datasets: [{
				data: main_villains_stats,
				backgroundColor: [
					window.chartColors.red,
					window.chartColors.orange,
					window.chartColors.yellow,
					window.chartColors.green,
					window.chartColors.blue,
				],
			}],
			
			// These labels appear in the legend and in the tooltips when hovering different arcs
			labels: main_villains_labels
		},
		options: {
			responsive: true,
			legend: {
				position: 'top',
			},
			title: {
				display: true,
				text: 'Combats contre les Méchants (total: ' + total_fights + ')'
			},
			animation: {
				animateScale: true,
				animateRotate: true
			}
		}
	});
}

function show_global_heroes_stats() {
	var main_heroes_stats_w = [];
	var main_heroes_stats_l = [];
	var total_heroes_played = 0;
	var main_heroes_labels = [];
	for (const h_id of Object.keys(heroes)) {
		if (per_hero_table[h_id]["counter"] > 0) {
			total_heroes_played += 1;
			main_heroes_stats_w.push(per_hero_table[h_id]["wins"]);
			main_heroes_stats_l.push(per_hero_table[h_id]["losses"]);
			main_heroes_labels.push(heroes[h_id]);
		}
		main_heroes_stats_w.push(per_hero_table[h_id]["wins"]);
		main_heroes_stats_l.push(per_hero_table[h_id]["losses"]);
	}
	
	var ctxMainHeroData = document.getElementById('AllHeroesData');	
	var mainHeroesDataChart = new Chart(ctxMainHeroData, {
		type: 'bar',
		data: {
			labels: main_heroes_labels,
			datasets: [{
				label: 'Victoires',
				backgroundColor: window.chartColors.green,
				data: main_heroes_stats_w
			}, {
				label: 'Défaites',
				backgroundColor: window.chartColors.red,
				data: main_heroes_stats_l
			}]

		},
		options: {
			title: {
				display: true,
				text: 'Héros joués'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			responsive: true,
			scales: {
				xAxes: [{
					stacked: true,
				}],
				yAxes: [{
					stacked: true
				}]
			}
		}
	});
}


